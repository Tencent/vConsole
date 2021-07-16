import VConsolePlugin from './plugin';
import { SvelteComponent } from 'svelte';

export class VConsoleSveltePlugin<T extends {} = {}> extends VConsolePlugin {
  Comp: typeof SvelteComponent;
  comp?: SvelteComponent;
  initialProps: T;
  $dom: HTMLElement;
  constructor(
    id: string,
    name: string,
    Comp: typeof SvelteComponent,
    renderProps: T
  ) {
    super(id, name);
    this.Comp = Comp;
    this.initialProps = renderProps;
  }
  onRenderTab(callback) {
    this.$dom = document.createElement('div');
    this.comp = new this.Comp({
      target: this.$dom,
      props: this.initialProps,
    });
    callback(this.$dom);
  }
  onRemove() {}
}

export default VConsoleSveltePlugin;
