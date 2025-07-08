// 聲明 js-cookie 模組
declare module 'js-cookie' {
  export interface CookieAttributes {
    expires?: number | Date | undefined;
    path?: string | undefined;
    domain?: string | undefined;
    secure?: boolean | undefined;
    sameSite?: 'strict' | 'lax' | 'none' | undefined;
  }

  export interface CookiesStatic<T extends object = object> {
    get(name: string): string | undefined;
    get(name: string, json: true): T | undefined;
    get(): { [key: string]: string };
    set(name: string, value: string | T, options?: CookieAttributes): void;
    remove(name: string, options?: CookieAttributes): void;
    getJSON(name: string): T | undefined;
    getJSON(): { [key: string]: T };
  }

  const Cookies: CookiesStatic;
  export default Cookies;
}
