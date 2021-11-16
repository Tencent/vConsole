type AConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;

export class VConsoleModel {
  public static singleton: VConsoleModel;
  protected _onDataUpdateCallbacks: Function[] = [];

  public static getSingleton<T extends VConsoleModel>(ctor: AConstructorTypeOf<T>): T {
    if (VConsoleModel.singleton) {
      return <T>VConsoleModel.singleton;
    }
    VConsoleModel.singleton = new ctor();
    return <T>VConsoleModel.singleton;
  }

  public onDataUpdate(cb: Function) {
    this._onDataUpdateCallbacks.push(cb);
  }

  public triggerDataUpdate() {
    for (const cb of this._onDataUpdateCallbacks) {
      if (typeof cb === 'function') {
        cb();
      }
    }
  }
}

export default VConsoleModel;
