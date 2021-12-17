import { writable } from 'svelte/store';

export const contentStore = (() => {
  const { subscribe, set, update } = writable({
    updateTime: 0,
  });
  return {
		subscribe,
    set,
    update,
		updateTime: () => {
      update((store) => {
        store.updateTime = Date.now();
        return store;
      });
    },
	};
})();
