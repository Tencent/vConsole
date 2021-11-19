type AConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;

export class VConsoleModel {
  public static singleton: { [ctorName: string] : VConsoleModel } = {};
  protected _onDataUpdateCallbacks: Function[] = [];

  public static getSingleton<T extends VConsoleModel>(ctor: AConstructorTypeOf<T>): T {
    const ctorName: string = ctor.prototype.constructor.name;
    if (VConsoleModel.singleton[ctorName]) {
      return <T>VConsoleModel.singleton[ctorName];
    }
    VConsoleModel.singleton[ctorName] = new ctor();
    return <T>VConsoleModel.singleton[ctorName];
  }
}

export default VConsoleModel;
