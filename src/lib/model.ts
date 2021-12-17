type AConstructorTypeOf<T, U extends any[] = any[]> = new (...args: U) => T;

export class VConsoleModel {
  public static singleton: { [ctorName: string] : VConsoleModel } = {};
  protected _onDataUpdateCallbacks: Function[] = [];

  /**
   * Get a singleton of a model.
   */
  public static getSingleton<T extends VConsoleModel>(ctor: AConstructorTypeOf<T>, ctorName: string): T {
    if (!ctorName) {
      // WARN: the constructor name will be rewritten after minimize,
      //       so the `ctor.prototype.constructor.name` will likely conflict,
      //       so the ctor string as a guarantee when ctorName is empty.
      ctorName = ctor.toString();
    }
    // console.log(ctorName, ctor);
    if (VConsoleModel.singleton[ctorName]) {
      return <T>VConsoleModel.singleton[ctorName];
    }
    VConsoleModel.singleton[ctorName] = new ctor();
    return <T>VConsoleModel.singleton[ctorName];
  }
}

export default VConsoleModel;
