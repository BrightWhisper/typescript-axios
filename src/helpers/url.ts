import { isDate, isPlainObject, isURLSearchParams } from './util';

interface URLOrigin {
  protocol: string;
  host: string;
}

// 编码参数并处理特殊字符
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']');
}

export function buildURL(
  url: string,
  params?: any,
  paramsSerializer?: (params: any) => string
): string {
  // 判断是否有params
  if (!params) return url;
  let serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    // 定义参数数组用于拼接params
    const parts: string[] = [];
    Object.keys(params).forEach(key => {
      const val = params[key];
      // 值是null或undefined的情况
      if (val === null || val === undefined) return;
      let values = [];
      if (Array.isArray(val)) {
        values = val;
        key += '[]';
      } else {
        values = [val];
      }
      values.forEach(val => {
        if (isDate(val)) {
          val = val.toISOString();
        }
        if (isPlainObject(val)) {
          val = JSON.stringify(val);
        }
        parts.push(`${encode(key)}=${encode(val)}`);
      });
    });
    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    // 处理带hash的情况
    const markIndex = url.indexOf('#');
    if (markIndex !== -1) {
      url = url.slice(0, markIndex);
    }
    // 处理url本身带参数的情况,本身有参数则拼接&和参数,没有则拼接?和参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }
  return url;
}

export function isAbsoluteURL(url: string): boolean {
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
}

export function combineURL(baseURL: string, relativeURL?: string): string {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
}

const urlParsingNode = document.createElement('a');
const currentOrigin = resolveURL(window.location.href);

export function isURLSameOrigin(requestURL: string): boolean {
  const parsedOrigin = resolveURL(requestURL);
  const pProtocol = parsedOrigin.protocol;
  const pHost = parsedOrigin.host;
  const cProtocol = currentOrigin.protocol;
  const cHost = currentOrigin.host;
  return pProtocol === cProtocol && pHost === cHost;
}

function resolveURL(url: string): URLOrigin {
  urlParsingNode.setAttribute('href', url);
  const { protocol, host } = urlParsingNode;
  return {
    protocol,
    host
  };
}
