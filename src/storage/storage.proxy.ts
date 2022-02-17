export const GetProxyHandler = <T extends Storage>() => {
  const handler: ProxyHandler<T> = {
    defineProperty(
      target: T,
      p: PropertyKey,
      attributes: PropertyDescriptor
    ): boolean {
      target.setItem(p.toString(), attributes.value);
      return true;
    },
    deleteProperty(target: T, p: PropertyKey): boolean {
      target.removeItem(p.toString());
      return true;
    },
    get(target: T, p: PropertyKey, _receiver: any): any {
      if (typeof p === 'string' && p in target) return target[p];
      const result = target.getItem(p.toString());
      return result !== null ? result : undefined;
    },
    getOwnPropertyDescriptor(
      target: T,
      p: PropertyKey
    ): PropertyDescriptor | undefined {
      if (p in target) return undefined;
      return {
        configurable: true,
        enumerable: true,
        value: target.getItem(p.toString()),
        writable: true,
      };
    },
    has(target: T, p: PropertyKey): boolean {
      if (typeof p === 'string' && p in target) return true;
      return target.getItem(p.toString()) !== null;
    },
    ownKeys(target: T): string[] {
      return target.keys;
    },
    preventExtensions(_: T): boolean {
      throw new TypeError('Can\'t prevent extensions on this proxy object.');
    },
    set(target: T, p: PropertyKey, value: any, _: any): boolean {
      target.setItem(p.toString(), value);
      return true;
    },
  };
  return handler;
};




