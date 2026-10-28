import type { IStorage } from './storage.model';

const TEXT_PREVIEW_LIMIT = 100 * 1024;
const BINARY_SNIFF_SIZE = 1024;

interface OpfsEntry {
  handle: any;
  kind: 'file' | 'directory';
  binary?: boolean;
}

export function isOpfsSupported() {
  return typeof navigator !== 'undefined'
    && !!navigator.storage
    && typeof (navigator.storage as any).getDirectory === 'function'
    && typeof window !== 'undefined'
    && window.isSecureContext;
}

/**
 * Read the Origin Private File System (OPFS) as a flat key-value list.
 * Directories are exposed as keys ending with `/`.
 */
export class OpfsStorage implements IStorage {
  public keys: string[] = [];
  private entries: Map<string, OpfsEntry> = new Map();
  private root: any = null;

  public get length() {
    return this.keys.length;
  }

  public key(index: number) {
    return index < this.keys.length ? this.keys[index] : null;
  }

  public async prepare() {
    try {
      this.root = await (navigator.storage as any).getDirectory();
      this.keys = [];
      this.entries.clear();
      await this.walk(this.root, '');
      this.keys.sort();
      return true;
    } catch (e) {
      this.keys = [];
      this.entries.clear();
      return false;
    }
  }

  public async getItem(key: string) {
    const entry = this.entries.get(key);
    if (!entry) {
      return '';
    }
    if (entry.kind === 'directory') {
      return '[Directory]';
    }
    try {
      const file: File = await entry.handle.getFile();
      const size = file.size;
      const head = await file.slice(0, Math.min(size, BINARY_SNIFF_SIZE)).arrayBuffer();
      entry.binary = this.isBinary(head);
      if (entry.binary) {
        return `[Binary] ${this.formatSize(size)}`;
      }
      if (size > TEXT_PREVIEW_LIMIT) {
        const text = await file.slice(0, TEXT_PREVIEW_LIMIT).text();
        return `${text}\n... [${this.formatSize(size)} in total]`;
      }
      return await file.text();
    } catch (e) {
      return `[Error] ${(e && (e as Error).message) || e}`;
    }
  }

  public async setItem(key: string, data: any) {
    const root = await this.getRoot();
    const isDirectory = key.endsWith('/');
    const parts = key.split('/').filter((part) => part !== '');
    if (isDirectory) {
      await this.getDirectory(root, parts, true);
      return;
    }
    const name = parts.pop();
    const dir = await this.getDirectory(root, parts, true);
    const fileHandle = await dir.getFileHandle(name, { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(data === null || data === undefined ? '' : String(data));
    await writable.close();
  }

  public async removeItem(key: string) {
    const root = await this.getRoot();
    const isDirectory = key.endsWith('/');
    const parts = key.split('/').filter((part) => part !== '');
    const name = parts.pop();
    const dir = await this.getDirectory(root, parts, false);
    await dir.removeEntry(name, { recursive: isDirectory });
  }

  public async clear() {
    const root = await this.getRoot();
    const entries: [string, boolean][] = [];
    const iterator = root.entries();
    let result = await iterator.next();
    while (!result.done) {
      const name: string = result.value[0];
      const handle = result.value[1];
      entries.push([name, handle.kind === 'directory']);
      result = await iterator.next();
    }
    for (let i = 0; i < entries.length; i++) {
      const [name, isDirectory] = entries[i];
      await root.removeEntry(name, { recursive: isDirectory });
    }
  }

  public isEditable(key: string) {
    const entry = this.entries.get(key);
    return !!entry && entry.kind === 'file' && !entry.binary;
  }

  private async walk(dir: any, prefix: string) {
    const iterator = dir.entries();
    let result = await iterator.next();
    while (!result.done) {
      const name: string = result.value[0];
      const handle = result.value[1];
      const path = prefix === '' ? name : `${prefix}/${name}`;
      if (handle.kind === 'directory') {
        const dirPath = `${path}/`;
        this.keys.push(dirPath);
        this.entries.set(dirPath, { handle, kind: 'directory' });
        await this.walk(handle, path);
      } else {
        this.keys.push(path);
        this.entries.set(path, { handle, kind: 'file' });
      }
      result = await iterator.next();
    }
  }

  private async getRoot() {
    if (!this.root) {
      this.root = await (navigator.storage as any).getDirectory();
    }
    return this.root;
  }

  private async getDirectory(root: any, parts: string[], create: boolean) {
    let dir = root;
    for (let i = 0; i < parts.length; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create });
    }
    return dir;
  }

  private isBinary(buffer: ArrayBuffer) {
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        return true;
      }
    }
    return false;
  }

  private formatSize(size: number) {
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
}
