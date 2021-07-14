import VConsoleSveltePlugin from '../lib/sveltePlugin';
import { StorageTab } from '../components/Storage';
export default class VConsoleStorageTab extends VConsoleSveltePlugin {
  constructor(id: string, name: string, renderProps = { propA: 1 }) {
    super(id, name, StorageTab, renderProps);
  }
}
