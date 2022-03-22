import { Axios, AxiosResponse } from 'axios'
import { gzip } from 'pako'

import { XyoApiConfig } from './Config'
import { XyoApiEnvelope } from './Envelope'

export class XyoApiBase<C extends XyoApiConfig = XyoApiConfig> {
  public config: C
  public axios: Axios

  constructor(config: C) {
    this.config = config
    this.axios = new Axios({
      headers: {
        ...this.headers,
        Accept: 'application/json, text/plain, *.*',
        'Content-Encoding': 'gzip',
        'Content-Type': 'application/json',
      },
      transformRequest: (data) => {
        return data ? gzip(JSON.stringify(data)).buffer : undefined
      },
      transformResponse: (data) => {
        try {
          return JSON.parse(data)
        } catch (ex) {
          return {}
        }
      },
    })
  }

  protected get root() {
    return this.config.root ?? '/'
  }

  private resolveRoot() {
    return `${this.config.apiDomain}${this.root}`
  }

  private static resolveResult<T>(result: AxiosResponse<XyoApiEnvelope<T>>) {
    return [result.data?.data, result.data, result] as [T, XyoApiEnvelope<T>, AxiosResponse<XyoApiEnvelope<T>>]
  }

  protected async getEndpointFull<T = unknown, D = unknown>(endPoint = '') {
    const result = await this.axios.get<XyoApiEnvelope<T>, AxiosResponse<XyoApiEnvelope<T>>, D>(
      `${this.resolveRoot()}${endPoint}`
    )
    return XyoApiBase.resolveResult<T>(result)
  }

  protected async getEndpoint<T = unknown, D = unknown>(endPoint = '') {
    return (await this.getEndpointFull<T, D>(endPoint))[0]
  }

  protected async postEndpointFull<T = unknown, D = unknown>(endPoint = '', data?: D) {
    const result = await this.axios.post<XyoApiEnvelope<T>, AxiosResponse<XyoApiEnvelope<T>>, D>(
      `${this.resolveRoot()}${endPoint}`,
      data
    )
    return XyoApiBase.resolveResult<T>(result)
  }

  protected async postEndpoint<T = unknown, D = unknown>(endPoint = '', data?: D) {
    return (await this.postEndpointFull<T, D>(endPoint, data))[0]
  }

  protected async putEndpointFull<T = unknown, D = unknown>(endPoint = '', data?: D) {
    const result = await this.axios.put<XyoApiEnvelope<T>, AxiosResponse<XyoApiEnvelope<T>>, D>(
      `${this.resolveRoot()}${endPoint}`,
      data
    )
    return XyoApiBase.resolveResult<T>(result)
  }

  protected async putEndpoint<T = unknown, D = unknown>(endPoint = '', data?: D) {
    return (await this.putEndpointFull<T, D>(endPoint, data))[0]
  }

  protected get headers(): Record<string, string> {
    const headers: Record<string, string> = {}
    if (this.config.jwtToken) {
      headers.Authorization = `Bearer ${this.config.jwtToken}`
    }
    if (this.config.apiKey) {
      headers['x-api-key'] = this.config.apiKey
    }
    return headers
  }

  public get authenticated() {
    return !!this.config.apiKey || !!this.config.jwtToken
  }
}
