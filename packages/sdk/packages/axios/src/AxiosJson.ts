import { Axios, AxiosHeaders, AxiosRequestConfig } from 'axios'
import { gzip } from 'pako'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AxiosJsonRequestConfig<D = any> = AxiosRequestConfig<D> & { compressLength?: number }

export class AxiosJson extends Axios {
  constructor(config?: AxiosJsonRequestConfig) {
    super(AxiosJson.axiosConfig(config))
  }

  private static axiosConfig({ compressLength, headers, ...config }: AxiosJsonRequestConfig = {}): AxiosRequestConfig {
    return {
      headers: this.buildHeaders(headers),
      transformRequest: (data, headers) => {
        const json = JSON.stringify(data)
        if (headers && data) {
          if (json.length > (compressLength ?? 1024)) {
            headers['Content-Encoding'] = 'gzip'
            return gzip(JSON.stringify(data)).buffer
          }
        }
        return JSON.stringify(data)
      },
      transformResponse: (data) => {
        try {
          return JSON.parse(data)
        } catch (ex) {
          return null
        }
      },
      ...config,
    }
  }

  private static buildHeaders(headers: AxiosRequestConfig['headers']) {
    const axiosHeaders = new AxiosHeaders()
    Object.entries(headers ?? {}).forEach(([key, value]) => axiosHeaders.set(key, value))
    axiosHeaders.set('Accept', 'application/json, text/plain, *.*')
    axiosHeaders.set('Content-Type', 'application/json')
    return axiosHeaders
  }
}
