import { VConsoleSveltePlugin } from '../lib/sveltePlugin';
import { default as StorageComp } from './storage.svelte';

export class VConsoleStoragePlugin extends VConsoleSveltePlugin {
  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, StorageComp, renderProps);
  }
}
