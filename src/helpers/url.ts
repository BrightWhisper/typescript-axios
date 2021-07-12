import { isDate, isPlainObject } from './util'

// 编码参数并处理特殊字符
function encode(val: string): string {
  return encodeURIComponent(val)
    .replace(/%40/g, '@')
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+')
    .replace(/%5B/gi, '[')
    .replace(/%5D/gi, ']')
}

export function buildURL(url: string, params?: any): string {
  // 判断是否有params
  if (!params) return url
  // 定义参数数组用于拼接params
  const parts: string[] = []
  Object.keys(params).forEach(key => {
    const val = params[key]
    // 值是null或undefined的情况
    if (val === null || val === undefined) return
    let values = []
    if (Array.isArray(val)) {
      values = val
      key += '[]'
    } else {
      values = [val]
    }
    values.forEach(val => {
      if (isDate(val)) {
        val = val.toISOString()
      }
      if (isPlainObject(val)) {
        val = JSON.stringify(val)
      }
      parts.push(`${encode(key)}=${encode(val)}`)
    })
  })

  let serializedParams = parts.join('&')
  if (serializedParams) {
    // 处理带hash的情况
    const markIndex = url.indexOf('#')
    if (markIndex !== -1) {
      console.log('11', url)
      url = url.slice(0, markIndex)
      console.log('12', url)
    }
    // 处理url本身带参数的情况,本身有参数则拼接&和参数,没有则拼接?和参数
    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams
  }

  return url
}
