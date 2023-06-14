import { ApiConfig, ApiResponseBody, ApiResponseTuple, ApiResponseTupleOrBody, ApiResponseType } from '@xyo-network/api-models'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'

import { ApiBase } from './Base'
import { objToQuery } from './objToQuery'

export type ApiSimpleQuery = PayloadFindFilter

export class ApiSimple<T = Payload, D = T, Q extends ApiSimpleQuery = ApiSimpleQuery, C extends ApiConfig = ApiConfig> extends ApiBase<C> {
  async delete(): Promise<ApiResponseBody<T>>
  async delete(responseType?: 'body'): Promise<ApiResponseBody<T>>
  async delete(responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  async delete(responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.deleteEndpoint(undefined, 'tuple')
      default:
        return await this.deleteEndpoint(undefined)
    }
  }

  async find(query?: Q): Promise<ApiResponseBody<T>>
  async find(query?: Q, responseType?: 'body'): Promise<ApiResponseBody<T>>
  async find(query?: Q, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  async find(query = {}, responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(objToQuery(query), 'tuple')
      default:
        return await this.getEndpoint(objToQuery(query))
    }
  }

  async get(): Promise<ApiResponseBody<T>>
  async get(responseType?: 'body'): Promise<ApiResponseBody<T>>
  async get(responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  async get(responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(undefined, 'tuple')
      default:
        return await this.getEndpoint(undefined)
    }
  }

  async post(data?: D): Promise<ApiResponseBody<T>>
  async post(data?: D, responseType?: 'body'): Promise<ApiResponseBody<T>>
  async post(data?: D, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  async post(data?: D, responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.postEndpoint(undefined, data, 'tuple')
      default:
        return await this.postEndpoint(undefined, data)
    }
  }

  async put(data?: D): Promise<ApiResponseBody<T>>
  async put(data?: D, responseType?: 'body'): Promise<ApiResponseBody<T>>
  async put(data?: D, responseType?: 'tuple'): Promise<ApiResponseTuple<T>>
  async put(data?: D, responseType?: ApiResponseType): Promise<ApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.putEndpoint(undefined, data, 'tuple')
      default:
        return await this.putEndpoint(undefined, data)
    }
  }
}
