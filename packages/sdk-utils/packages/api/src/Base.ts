import { AxiosJson } from '@xylabs/axios'
import {
  ApiConfig,
  ApiEnvelope,
  ApiError,
  ApiReportable,
  ApiResponse,
  ApiResponseBody,
  ApiResponseTuple,
  ApiResponseTupleOrBody,
  ApiResponseType,
} from '@xyo-network/api-models'

export class ApiBase<C extends ApiConfig = ApiConfig> implements ApiReportable {
  readonly config: C
  protected axios: AxiosJson

  constructor(config: C) {
    this.config = config
    this.axios = new AxiosJson({ ...this.config, headers: this.headers })
  }

  get authenticated() {
    return !!this.config.apiKey || !!this.config.jwtToken
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

  protected get query() {
    return this.config.query ?? ''
  }

  protected get root() {
    return this.config.root ?? '/'
  }

  private static resolveResponse<T>(result?: ApiResponse<ApiEnvelope<T>>) {
    return [result?.data?.data, result?.data, result] as ApiResponseTuple<T>
  }

  private static shapeResponse<T = unknown>(response: ApiResponse<ApiEnvelope<T>> | undefined, responseType?: ApiResponseType) {
    const resolvedResponse = ApiBase.resolveResponse(response)
    return responseType === 'tuple' ? resolvedResponse : resolvedResponse[0]
  }

  onError(error: ApiError, depth = 0) {
    this.config.reportableParent?.onError?.(error, depth + 1)
    this.config.onError?.(error, depth)
  }

  onFailure(response: ApiResponse, depth = 0) {
    this.config.reportableParent?.onFailure?.(response, depth + 1)
    this.config.onFailure?.(response, depth)
  }

  onSuccess(response: ApiResponse, depth = 0) {
    this.config.reportableParent?.onSuccess?.(response, depth + 1)
    this.config.onSuccess?.(response, depth)
  }

  protected async deleteEndpoint<T = unknown>(endPoint?: string): Promise<ApiResponseBody<T>>
  protected async deleteEndpoint<T = unknown>(endPoint?: string, responseType?: 'body'): Promise<ApiResponseBody<T>>
  protected async deleteEndpoint<T = unknown>(endPoint?: string, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  protected async deleteEndpoint<T = unknown>(endPoint = '', responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.delete<ApiEnvelope<T>, ApiResponse<ApiEnvelope<T>>>(`${this.resolveRoot()}${endPoint}${this.query}`)
    })
    return ApiBase.shapeResponse<T>(response, responseType)
  }

  protected async getEndpoint<T = unknown>(endPoint?: string): Promise<ApiResponseBody<T>>
  protected async getEndpoint<T = unknown>(endPoint?: string, responseType?: 'body'): Promise<ApiResponseBody<T>>
  protected async getEndpoint<T = unknown>(endPoint?: string, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  protected async getEndpoint<T = unknown>(endPoint = '', responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.get<ApiEnvelope<T>, ApiResponse<ApiEnvelope<T>>>(`${this.resolveRoot()}${endPoint}${this.query}`)
    })
    return ApiBase.shapeResponse<T>(response, responseType)
  }

  protected handleMonitorResponseError<T>(error: ApiError, trapAxiosException: boolean) {
    if (!error.isError) {
      throw error
    }

    if (trapAxiosException) {
      error.response ? this.onFailure(error.response) : this.onError(error)
      if (this.config.throwFailure) {
        throw error
      }
      return error.response as ApiResponse<ApiEnvelope<T>>
    }
  }

  protected async monitorResponse<T>(closure: () => Promise<ApiResponse<ApiEnvelope<T>>>) {
    //we use this to prevent accidental catching on exceptions in callbacks
    let trapAxiosException = true
    try {
      const response = await closure()
      trapAxiosException = false

      response.status < 300 ? this.onSuccess(response) : this.onFailure(response)

      return response
    } catch (error) {
      this.handleMonitorResponseError(error as ApiError, trapAxiosException)
    }
  }

  protected async postEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D): Promise<ApiResponseBody<T>>
  protected async postEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D, responseType?: 'body'): Promise<ApiResponseBody<T>>
  protected async postEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  protected async postEndpoint<T = unknown, D = unknown>(
    endPoint = '',
    data?: D,
    responseType?: ApiResponseType,
  ): Promise<ApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.post<ApiEnvelope<T>, ApiResponse<ApiEnvelope<T>, D>, D>(`${this.resolveRoot()}${endPoint}${this.query}`, data)
    })
    return ApiBase.shapeResponse<T>(response, responseType)
  }

  protected async putEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D): Promise<ApiResponseBody<T>>
  protected async putEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D, responseType?: 'body'): Promise<ApiResponseBody<T>>
  protected async putEndpoint<T = unknown, D = unknown>(endPoint?: string, data?: D, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  protected async putEndpoint<T = unknown, D = unknown>(endPoint = '', data?: D, responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    const response = await this.monitorResponse<T>(async () => {
      return await this.axios.put<ApiEnvelope<T>, ApiResponse<ApiEnvelope<T>, D>, D>(`${this.resolveRoot()}${endPoint}${this.query}`, data)
    })
    return ApiBase.shapeResponse<T>(response, responseType)
  }

  private resolveRoot() {
    return `${this.config.apiDomain}${this.root}`
  }
}
