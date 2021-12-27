import type { VConsoleModel } from './model';

export class VConsolePluginExporter {
  protected model: VConsoleModel;
  protected pluginId: string;

  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }

  public destroy() {
    this.model = undefined;
  }
}
