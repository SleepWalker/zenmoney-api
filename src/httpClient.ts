import got from 'got';
import { CookieJar } from 'tough-cookie';

const defaultContext: {
  token: null | string;
} = {
  token: null,
};

function proxy(org, proxyFn) {
  return new Proxy(proxyFn(org), {
    get: (obj, prop) => (prop in obj ? obj[prop] : org[prop]),
  });
}

const cookieJar = proxy(new CookieJar(), (obj: CookieJar) => {
  return {
    setCookie: async (rawCookie: string, url: string) =>
      obj.setCookie(rawCookie, url),
    getCookieString: async (url: string) => obj.getCookieString(url),
  };
});

const client = got.extend({
  prefixUrl: 'https://api.zenmoney.ru',
  responseType: 'json',
  retry: {
    limit: 4,
    methods: [
      'GET',
      // currently all POST requests are idempotent and can be safely retried
      'POST',
    ],
  },
  cookieJar,
  hooks: {
    beforeRequest: [
      (options) => {
        const { token } = defaultContext;

        if (token) {
          options.headers.authorization = `Bearer ${token}`;
        }
      },
    ],
  },
});

export const setToken = (token: string): void => {
  defaultContext.token = token;
};

export default client;
