import { Axios } from 'axios'
import { gzip } from 'pako'

import { XyoApiConfig } from './Config'
import { XyoApiEnvelope } from './Envelope'
import { XyoApiError } from './Error'
import { XyoApiResponse } from './Response'

export class XyoApiBase<C extends XyoApiConfig = XyoApiConfig> {
  public readonly config: C
  protected axios: Axios

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
          return null
        }
      },
    })
  }

  protected reportError(error: XyoApiError) {
    this.config.onError?.(error)
  }

  protected reportFailure(response: XyoApiResponse) {
    this.config.onFailure?.(response)
  }

  protected get root() {
    return this.config.root ?? '/'
  }

  private resolveRoot() {
    return `${this.config.apiDomain}${this.root}`
  }

  private static resolveResponse<T>(result?: XyoApiResponse<XyoApiEnvelope<T>>) {
    return [result?.data?.data, result?.data, result] as [T, XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>]
  }

  protected async monitorResponse<T>(closure: () => Promise<XyoApiResponse<XyoApiEnvelope<T>>>) {
    try {
      const response = await closure()

      if (response.status >= 300) {
        this.reportFailure(response)
      }

      return response
    } catch (ex) {
      const error = ex as XyoApiError
      if (error.isAxiosError) {
        this.reportError(error)
      } else {
        throw ex
      }
    }
  }

  protected async getEndpointFull<T = unknown, D = unknown>(endPoint = '') {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.get<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>, D>(
        `${this.resolveRoot()}${endPoint}`
      )
    })
    return XyoApiBase.resolveResponse(response)
  }

  protected async getEndpoint<T = unknown, D = unknown>(endPoint = '') {
    return (await this.getEndpointFull<T, D>(endPoint))?.[0]
  }

  protected async postEndpointFull<T = unknown, D = unknown>(endPoint = '', data?: D) {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.post<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>, D>(
        `${this.resolveRoot()}${endPoint}`,
        data
      )
    })
    return XyoApiBase.resolveResponse(response)
  }

  protected async postEndpoint<T = unknown, D = unknown>(endPoint = '', data?: D) {
    return (await this.postEndpointFull<T, D>(endPoint, data))?.[0]
  }

  protected async putEndpointFull<T = unknown, D = unknown>(endPoint = '', data?: D) {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.put<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>, D>(
        `${this.resolveRoot()}${endPoint}`,
        data
      )
    })
    return XyoApiBase.resolveResponse(response)
  }

  protected async putEndpoint<T = unknown, D = unknown>(endPoint = '', data?: D) {
    return (await this.putEndpointFull<T, D>(endPoint, data))?.[0]
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
