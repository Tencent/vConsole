import type { IStorage } from './storage.model';

export interface CookieOptions {
  path?: string | null;
  domain?: string | null;
  expires?: Date | null;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

const parseCookieString = (str: string): { [key: string]: string } => {
  if (!str || str.length === 0) {
    return {};
  }
  const cookies: { [key: string]: string } = {};
  const pairs = str.split(';');
  for (let i = 0; i < pairs.length; i++) {
    const idx = pairs[i].indexOf('=');
    if (idx < 0) {
      continue;
    }
    let key = pairs[i].substring(0, idx).replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''); // trim whitespace
    let value = pairs[i].substring(idx + 1, pairs[i].length);
    try {
      key = decodeURIComponent(key);
    } catch (e) {
      // do nothing
    }
    try {
      value = decodeURIComponent(value);
    } catch (e) {
      // do nothing
    }
    cookies[key] = value;
  }
  return cookies;
};

const formatOptions = (o: CookieOptions = {}) => {
  const { path, domain, expires, secure, sameSite } = o;
  const sameSiteValue = ['none', 'lax', 'strict'].indexOf((sameSite || '').toLowerCase()) > -1 ? sameSite : null;
  return [
    typeof path === 'undefined' || path === null ? '' : ';path=' + path,
    typeof domain === 'undefined' || domain === null ? '' : ';domain=' + domain,
    typeof expires === 'undefined' || expires === null ? '' : ';expires=' + expires.toUTCString(),
    typeof secure === 'undefined' || secure === false ? '' : ';secure',
    sameSiteValue === null ? '' : ';SameSite=' + sameSiteValue,
  ].join('');
};

const setCookie = (key: string, data: string, options: CookieOptions) => {
  if (typeof document !== 'undefined' && typeof document.cookie !== 'undefined') {
    document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(data) + formatOptions(options);
  }
};

const getCookie = () => {
  return typeof document === 'undefined' || typeof document.cookie === 'undefined' ? '' : document.cookie;
};


export class CookieStorage implements IStorage {

  public get length() {
    return this.keys.length;
  }

  /**
   * Returns sorted keys.
   */
  public get keys() {
    const cookies = parseCookieString(getCookie());
    return Object.keys(cookies).sort();
  }

  public key(index: number) {
    return index < this.keys.length ? this.keys[index] : null;
  }

  public setItem(key: string, data: string, cookieOptions?: CookieOptions) {
    setCookie(key, data, cookieOptions);
  }

  public getItem(key: string) {
    const cookies = parseCookieString(getCookie());
    return Object.prototype.hasOwnProperty.call(cookies, key) ? cookies[key] : null;
  }

  public removeItem(key: string, cookieOptions?: CookieOptions) {
    // Deep remove a cookie.
    const domains: string[] = ['', '/'];
    const hostname = location?.hostname?.split('.') || [];
    while (hostname.length > 1) {
      domains.push(hostname.join('.'));
      hostname.shift();
    }

    // delete cookies from all domains and all paths
    for (let i = 0; i < domains.length; i++) {
      const pathname = location?.pathname?.split('/') || [];
      let path = '';
      while (pathname.length > 0) {
        const p = pathname.shift();
        path += (path === '/' ? '' : '/') + p;
        const options: CookieOptions = {
          ...cookieOptions,
          path,
          domain: domains[i],
          expires: new Date(0),
        };
        setCookie(key, '', options);
      }
    }
  }

  public clear() {
    // Deep clear all cookies.
    const keys = [...this.keys]; // use a copy of `this.keys` to prevent array changing dynamically
    for (let i = 0; i < keys.length; i++) {
      this.removeItem(keys[i]);
    }
  }

}
