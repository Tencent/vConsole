import VConsoleSveltePlugin from '../lib/sveltePlugin';
import { default as StorageComp } from './storage.svelte';

export default class VConsoleStorageTab extends VConsoleSveltePlugin {
  constructor(id: string, name: string, renderProps = { }) {
    super(id, name, StorageComp, renderProps);
  }
}
