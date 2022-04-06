import { Axios } from 'axios'
import { gzip } from 'pako'

import {
  XyoApiConfig,
  XyoApiEnvelope,
  XyoApiError,
  XyoApiReportable,
  XyoApiResponse,
  XyoApiResponseBody,
  XyoApiResponseTuple,
  XyoApiResponseTupleOrBody,
  XyoApiResponseType,
} from './models'

export class XyoApiBase<C extends XyoApiConfig = XyoApiConfig> implements XyoApiReportable {
  public readonly config: C
  protected axios: Axios

  constructor(config: C) {
    this.config = config
    this.axios = new Axios({
      headers: {
        ...this.headers,
        Accept: 'application/json, text/plain, *.*',
        'Content-Type': 'application/json',
      },
      transformRequest: (data, headers) => {
        const json = JSON.stringify(data)
        if (headers && data) {
          if (json.length > (this.config.compressionThreshold ?? 1024)) {
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
    })
  }

  onError(error: XyoApiError, depth = 0) {
    this.config.reportableParent?.onError?.(error, depth + 1)
    this.config.onError?.(error, depth)
  }

  onFailure(response: XyoApiResponse, depth = 0) {
    this.config.reportableParent?.onFailure?.(response, depth + 1)
    this.config.onFailure?.(response, depth)
  }

  onSuccess(response: XyoApiResponse, depth = 0) {
    this.config.reportableParent?.onSuccess?.(response, depth + 1)
    this.config.onSuccess?.(response, depth)
  }

  protected get root() {
    return this.config.root ?? '/'
  }

  protected get query() {
    return this.config.query ?? ''
  }

  private resolveRoot() {
    return `${this.config.apiDomain}${this.root}`
  }

  private static resolveResponse<T>(result?: XyoApiResponse<XyoApiEnvelope<T>>) {
    return [result?.data?.data, result?.data, result] as XyoApiResponseTuple<T>
  }

  protected async monitorResponse<T>(closure: () => Promise<XyoApiResponse<XyoApiEnvelope<T>>>) {
    //we use this to prevent accidental catching on exceptions in callbacks
    let trapAxiosException = true
    try {
      const response = await closure()
      trapAxiosException = false

      if (response.status < 300) {
        this.onSuccess(response)
      } else if (response.status >= 300) {
        this.onFailure(response)
      }

      return response
    } catch (ex) {
      const error = ex as XyoApiError
      if (trapAxiosException && error.isAxiosError) {
        if (error.response) {
          this.onFailure(error.response)
          if (this.config.throwFailure) {
            throw error
          }
          return error.response as XyoApiResponse<XyoApiEnvelope<T>>
        } else {
          this.onError(error)
          if (this.config.throwError) {
            throw error
          }
        }
      } else {
        throw ex
      }
    }
  }

  protected async getEndpoint<T = unknown>(endPoint?: string): Promise<XyoApiResponseBody<T>>
  protected async getEndpoint<T = unknown>(endPoint?: string, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  protected async getEndpoint<T = unknown>(endPoint?: string, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  protected async getEndpoint<T = unknown>(
    endPoint = '',
    responseType?: XyoApiResponseType
  ): Promise<XyoApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.get<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>>(
        `${this.resolveRoot()}${endPoint}${this.query}`
      )
    })
    const resolvedResponse = XyoApiBase.resolveResponse(response)
    return responseType === 'tuple' ? resolvedResponse : resolvedResponse[0]
  }

  protected async postEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D): Promise<XyoApiResponseBody<T>>
  protected async postEndpoint<T = unknown, D = unknown>(
    endPoint?: string,
    data?: D,
    responseType?: 'body'
  ): Promise<XyoApiResponseBody<T>>
  protected async postEndpoint<T = unknown, D = unknown>(
    endPoint?: string,
    data?: D,
    responseType?: 'tuple'
  ): Promise<XyoApiResponseTuple<T>>
  protected async postEndpoint<T = unknown, D = unknown>(
    endPoint = '',
    data?: D,
    responseType?: XyoApiResponseType
  ): Promise<XyoApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.post<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>, D>, D>(
        `${this.resolveRoot()}${endPoint}${this.query}`,
        data
      )
    })
    const resolvedResponse = XyoApiBase.resolveResponse(response)
    return responseType === 'tuple' ? resolvedResponse : resolvedResponse[0]
  }

  protected async putEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D): Promise<XyoApiResponseBody<T>>
  protected async putEndpoint<T = unknown, D = unknown>(
    endPoint?: string,
    data?: D,
    responseType?: 'body'
  ): Promise<XyoApiResponseBody<T>>
  protected async putEndpoint<T = unknown, D = unknown>(
    endPoint?: string,
    data?: D,
    responseType?: 'tuple'
  ): Promise<XyoApiResponseTuple<T>>
  protected async putEndpoint<T = unknown, D = unknown>(
    endPoint = '',
    data?: D,
    responseType?: XyoApiResponseType
  ): Promise<XyoApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.put<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>, D>, D>(
        `${this.resolveRoot()}${endPoint}${this.query}`,
        data
      )
    })
    const resolvedResponse = XyoApiBase.resolveResponse(response)
    return responseType === 'tuple' ? resolvedResponse : resolvedResponse[0]
  }

  protected async deleteEndpoint<T = unknown>(endPoint?: string): Promise<XyoApiResponseBody<T>>
  protected async deleteEndpoint<T = unknown>(endPoint?: string, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  protected async deleteEndpoint<T = unknown>(
    endPoint?: string,
    responseType?: 'tuple'
  ): Promise<XyoApiResponseTuple<T>>
  protected async deleteEndpoint<T = unknown>(
    endPoint = '',
    responseType?: XyoApiResponseType
  ): Promise<XyoApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.delete<XyoApiEnvelope<T>, XyoApiResponse<XyoApiEnvelope<T>>>(
        `${this.resolveRoot()}${endPoint}${this.query}`
      )
    })
    const resolvedResponse = XyoApiBase.resolveResponse(response)
    return responseType === 'tuple' ? resolvedResponse : resolvedResponse[0]
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
