import { XyoPayload } from '../core'
import { XyoApiBase } from './Base'
import {
  XyoApiConfig,
  XyoApiResponseBody,
  XyoApiResponseTuple,
  XyoApiResponseTupleOrBody,
  XyoApiResponseType,
} from './models'

export class XyoApiSimple<T = XyoPayload, D = T, C extends XyoApiConfig = XyoApiConfig> extends XyoApiBase<C> {
  public async get(): Promise<XyoApiResponseBody<T>>
  public async get(responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  public async get(responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  public async get(responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.getEndpoint(undefined, 'tuple')
      default:
        return await this.getEndpoint(undefined)
    }
  }

  public async post(data?: D): Promise<XyoApiResponseBody<T>>
  public async post(data?: D, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  public async post(data?: D, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  public async post(data?: D, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.postEndpoint(undefined, data, 'tuple')
      default:
        return await this.postEndpoint(undefined, data)
    }
  }

  public async put(data?: D): Promise<XyoApiResponseBody<T>>
  public async put(data?: D, responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  public async put(data?: D, responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  public async put(data?: D, responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.putEndpoint(undefined, data, 'tuple')
      default:
        return await this.putEndpoint(undefined, data)
    }
  }

  public async delete(): Promise<XyoApiResponseBody<T>>
  public async delete(responseType?: 'body'): Promise<XyoApiResponseBody<T>>
  public async delete(responseType?: 'tuple'): Promise<XyoApiResponseTuple<T>>
  public async delete(responseType?: XyoApiResponseType): Promise<XyoApiResponseTupleOrBody<T>> {
    switch (responseType) {
      case 'tuple':
        return await this.deleteEndpoint(undefined, 'tuple')
      default:
        return await this.deleteEndpoint(undefined)
    }
  }
}
