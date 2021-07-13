// interface ICookieOptions {
//   expires?: number | string | Date;
//   path?: string;
//   domain?: string;
//   secure?: boolean;
// }

// interface CookieStroage extends Storage {}
// class CookieStroage {
//   private formatOptions({ expires, path, domain, secure }: ICookieOptions) {
//     var expiresPart = "";
//     if (expires) {
//       switch (expires.constructor) {
//         case Number:
//           expiresPart =
//             expires === Infinity
//               ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT"
//               : "; max-age=" + expires;
//           break;
//         case String:
//           expiresPart = "; expires=" + expires;
//           break;
//         case Date:
//           expiresPart = "; expires=" + (expires as Date).toUTCString();
//           break;
//       }
//     }
//     return `${expiresPart}${domain ? "; domain=" + domain : ""}${
//       path ? "; path=" + path : ""
//     }${secure ? "; secure" : ""}`;
//   }
//   public getItem(key: string): string | null {
//     return (
//       decodeURIComponent(
//         document.cookie.replace(
//           new RegExp(
//             "(?:(?:^|.*;)\\s*" +
//               encodeURIComponent(key).replace(/[-.+*]/g, "\\$&") +
//               "\\s*\\=\\s*([^;]*).*$)|^.*$"
//           ),
//           "$1"
//         )
//       ) || null
//     );
//   }
//   public setItem(key: string, value: string, options: ICookieOptions = {}) {
//     if (!key || /^(?:expires|max\-age|path|domain|secure)$/i.test(key)) {
//       return false;
//     }
//     document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
//       value
//     )}${this.formatOptions(options)}`;
//     return true;
//   }
//   public removeItem(key: string, { path, domain }: ICookieOptions = {}) {
//     if (!key || !this.getItem(key)) {
//       return false;
//     }
//     document.cookie = `encodeURIComponent(key) =; ${this.formatOptions({
//       path,
//       domain,
//       expires: "Thu, 01 Jan 1970 00:00:00 GMT",
//     })}`;
//     return true;
//   }
//   public key(index: number) {
//     return document.cookie
//       .replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "")
//       .split(/\s*(?:\=[^;]*)?;\s*/)[index];
//   }
//   get length() {
//     return document.cookie.split(/\s*(?:\=[^;]*)?;\s*/).length;
//   }
//   // [Symbol.iterator]() { return this.a.values() }
// }

import { CookieStorage as CookiesStorage } from "cookie-storage";
export const cookiesStorage = new CookiesStorage();
