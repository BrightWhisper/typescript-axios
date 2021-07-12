import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from './types'
import { parseHeaders } from './helpers/headers'
import { transformResponse } from './helpers/data'
import { createError } from './helpers/error'

export function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { data = null, url, method = 'get', headers, responseType, timeout } = config

    const request = new XMLHttpRequest()

    if (responseType) {
      request.responseType = responseType
    }

    if (timeout) {
      request.timeout = timeout
    }

    request.open(method.toUpperCase(), url, true)

    request.onreadystatechange = () => {
      if (request.readyState !== 4) return
      // 网络或超时错误的时候status为0
      if (request.status === 0) return
      const responseHeaders = request.getAllResponseHeaders()
      const responseData = responseType !== 'text' ? request.response : request.responseText
      const response: AxiosResponse = {
        data: transformResponse(responseData),
        status: request.status,
        statusText: request.statusText,
        headers: parseHeaders(responseHeaders),
        config,
        request
      }
      handleResponse(response)
    }

    request.onerror = () => {
      reject(createError('Network Error', config, null, request))
    }

    request.ontimeout = () => {
      reject(createError(`Timeout of ${timeout}`, config, 'ECONNABORTED', request))
    }

    Object.keys(headers).forEach(name => {
      if (data === null && name.toLowerCase() === 'content-type') {
        delete headers[name]
        return
      }
      request.setRequestHeader(name, headers[name])
    })

    request.send(data)

    const handleResponse = (response: AxiosResponse) => {
      // 200到300之间或304表示成功请求
      if ((response.status >= 200 && response.status < 300) || response.status === 304) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }
  })
}
