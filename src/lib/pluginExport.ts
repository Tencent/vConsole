
export class VConsolePluginExport {
  protected injectTarget: any;
  protected providerMap: Map<string, any> = new Map();

  public provide(name: string, methods: any) {
    this.providerMap.set(name, methods);
    if (this.injectTarget) {
      this.injectTarget[name] = methods;
    }
  }

  public inject(target: any) {
    this.injectTarget = target;
    this.providerMap.forEach((methods, name) => {
      target[name] = methods;
    });
  }

  public remove(name: string) {
    this.providerMap.delete(name);
    if (this.injectTarget && this.injectTarget[name]) {
      this.injectTarget[name] = undefined;
      delete this.injectTarget[name];
    }
  }
}

export const PluginExport = new VConsolePluginExport();
