const createRecycleManager = () => {
  const recycles: { key: number; index: number; show: boolean }[] = [];

  const poolKeys: number[] = [];
  let poolStartIndex = 0;
  let poolEndIndex = 0;

  let lastItemCount = 0;
  let lastStart = 0;
  let lastEnd = 0;

  const update = (itemCount: number, start: number, end: number) => {
    if (lastItemCount === itemCount && lastStart === start && lastEnd === end)
      return recycles;

    const poolCount = poolKeys.length;

    // 计算新的 visible 区域
    const newFirstPool =
      start <= poolEndIndex
        ? // 1. 开头一定在 [0, start]
          Math.max(
            0,
            Math.min(
              start,
              // 2. 开头一定在 [poolStartIndex, poolEndIndex) 之间
              Math.max(
                poolStartIndex,
                Math.min(poolEndIndex - 1, end - poolCount)
              )
            )
          )
        : start; // poolEndIndex 如果比 start 小，则前部无法保留下来

    const newLastPool =
      poolStartIndex <= end
        ? // 1. 结尾一定在 [end, itemCount] 之间
          Math.max(
            end,
            Math.min(
              itemCount,
              // 2. 结尾一定在 (poolStartIndex, poolEndIndex] 之间
              Math.max(
                poolStartIndex + 1,
                Math.min(poolEndIndex, newFirstPool + poolCount)
              )
            )
          )
        : end; // end 如果比 poolStartIndex 小，则后部无法保留下来

    if (poolCount === 0 || newLastPool - newFirstPool < poolCount) {
      // 无法复用，全都重新生成
      const count = (recycles.length = poolKeys.length = end - start);
      for (let i = 0; i < count; i += 1) {
        poolKeys[i] = i;
        recycles[i] = {
          key: i,
          index: i + start,
          show: true,
        };
      }
      poolStartIndex = start;
      poolEndIndex = end;
      lastItemCount = itemCount;
      lastStart = start;
      lastEnd = end;
      return recycles;
    }

    let usedPoolIndex = 0;
    let usedPoolOffset = 0;

    // 复用区域
    let reuseStart = 0;
    let reuseEnd = 0;

    if (poolEndIndex < newFirstPool || newLastPool < poolStartIndex) {
      // 完全没有交集，随便复用
      reuseStart = newFirstPool;
      reuseEnd = newFirstPool + poolCount;
    } else if (poolStartIndex < newFirstPool) {
      // 开头复用
      usedPoolOffset = newFirstPool - poolStartIndex;
      reuseStart = newFirstPool;
      reuseEnd = newFirstPool + poolCount;
    } else if (newLastPool < poolEndIndex) {
      // 尾部复用
      usedPoolOffset = poolCount - (poolEndIndex - newLastPool);
      reuseStart = newLastPool - poolCount;
      reuseEnd = newLastPool;
    } else if (newFirstPool <= poolStartIndex && poolEndIndex <= newLastPool) {
      // 新的 visible 是完全子集，直接复用
      reuseStart = poolStartIndex;
      reuseEnd = poolEndIndex;
    }

    // 开头不可见区域
    // 如果有不可见区域，则一定是来自上一次 visible 的复用 row
    for (let i = newFirstPool; i < start; i += 1, usedPoolIndex += 1) {
      const poolKey = poolKeys[(usedPoolOffset + usedPoolIndex) % poolCount];
      const recycle = recycles[i - newFirstPool];
      recycle.key = poolKey;
      recycle.index = i;
      recycle.show = false;
    }

    // 可见区域
    for (let i = start, keyIndex = 0; i < end; i += 1) {
      let poolKey: number;
      if (reuseStart <= i && i < reuseEnd) {
        // 复用 row
        poolKey = poolKeys[(usedPoolOffset + usedPoolIndex) % poolCount];
        usedPoolIndex += 1;
      } else {
        // 新建 row
        poolKey = poolCount + keyIndex;
        keyIndex += 1;
      }
      const recycleIndex = i - newFirstPool;
      if (recycleIndex < recycles.length) {
        const recycle = recycles[recycleIndex];
        recycle.key = poolKey;
        recycle.index = i;
        recycle.show = true;
      } else {
        recycles.push({
          key: poolKey,
          index: i,
          show: true,
        });
      }
    }

    // 末尾不可见区域
    // 如果有不可见区域，则一定是来自上一次 visible 的复用 row
    for (let i = end; i < newLastPool; i += 1, usedPoolIndex += 1) {
      const poolKey = poolKeys[(usedPoolOffset + usedPoolIndex) % poolCount];
      const recycle = recycles[i - newFirstPool];
      recycle.key = poolKey;
      recycle.index = i;
      recycle.show = false;
    }

    // 更新 poolKeys
    for (let i = 0; i < recycles.length; i += 1) {
      poolKeys[i] = recycles[i].key;
    }
    recycles.sort((a, b) => a.key - b.key);
    poolStartIndex = newFirstPool;
    poolEndIndex = newLastPool;
    lastItemCount = itemCount;
    lastStart = start;
    lastEnd = end;

    return recycles;
  };

  return update;
};

export default createRecycleManager;
