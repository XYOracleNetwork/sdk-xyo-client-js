import { XyoApiConfig, XyoApiResponseBody, XyoApiResponseTuple, XyoApiResponseTupleOrBody, XyoApiResponseType } from '@xyo-network/api-models'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'

import { XyoApiBase } from './Base'
import { objToQuery } from './objToQuery'

export type XyoApiSimpleQuery = PayloadFindFilter

export class XyoApiSimple<
  T = Payload,
  D = T,
  Q extends XyoApiSimpleQuery = XyoApiSimpleQuery,
  C extends XyoApiConfig = XyoApiConfig,
> extends XyoApiBase<C> {
  async delete(): Promise<XyoApiResponseBody<T>>
  async delete(responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  async delete(responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  async delete(responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.deleteEndpoint(undefined, 'tuple')
      default:
        return await this.deleteEndpoint(undefined)
    }
  }

  async find(query?: Q): Promise<XyoApiResponseBody<T>>
  async find(query?: Q, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  async find(query?: Q, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  async find(query = {}, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(objToQuery(query), 'tuple')
      default:
        return await this.getEndpoint(objToQuery(query))
    }
  }

  async get(): Promise<XyoApiResponseBody<T>>
  async get(responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  async get(responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  async get(responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(undefined, 'tuple')
      default:
        return await this.getEndpoint(undefined)
    }
  }

  async post(data?: D): Promise<XyoApiResponseBody<T>>
  async post(data?: D, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  async post(data?: D, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  async post(data?: D, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.postEndpoint(undefined, data, 'tuple')
      default:
        return await this.postEndpoint(undefined, data)
    }
  }

  async put(data?: D): Promise<XyoApiResponseBody<T>>
  async put(data?: D, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  async put(data?: D, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  async put(data?: D, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.putEndpoint(undefined, data, 'tuple')
      default:
        return await this.putEndpoint(undefined, data)
    }
  }
}
