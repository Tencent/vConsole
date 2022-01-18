import { CookieStorage } from 'cookie-storage';
import type { CookieOptions } from 'cookie-storage/lib/cookie-options';

export class VConsoleCookieStorage extends CookieStorage {
  /**
   * Deep remove a cookie.
   */
  public removeItem(key: string, cookieOptions?: CookieOptions): void {
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
        const options = {
          ...cookieOptions,
          path,
          domain: domains[i],
        };
        // console.log('domain:', domains[i], 'path:', path);
        super.removeItem(key, options);
      }
    }
  }

  /**
   * Deep clear all cookies.
   */
  public clear() {
    const keys = Object.keys(this);
    for (let i = 0; i < keys.length; i++) {
      this.removeItem(keys[i]);
    }
  }
}
