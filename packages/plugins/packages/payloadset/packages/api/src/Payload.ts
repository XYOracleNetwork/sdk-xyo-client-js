import { Hash } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

export const ApiCallSchema = 'network.xyo.api.call'
export type ApiCallSchema = typeof ApiCallSchema

export type Verb = 'get' | 'post'

export type ApiCall = Payload<
  {
    uri: string
    verb?: Verb
  },
  ApiCallSchema
>

export const ApiCallResultSchema = 'network.xyo.api.call.result'
export type ApiCallResultSchema = typeof ApiCallResultSchema

export interface HttpMeta {
  code?: string
  status?: number
}

export type ApiCallJsonResult<T extends object | [] = object> = Payload<
  {
    call: Hash
    contentType: 'application/json'
    data: T
  },
  ApiCallResultSchema
>

export type ApiCallBase64Result = Payload<
  {
    call: Hash
    contentType: Exclude<string, ApiCallJsonResult['contentType']>
    data: string
  },
  ApiCallResultSchema
>

export type ApiCallErrorResult = Payload<
  {
    call: Hash
    http?: HttpMeta
  },
  ApiCallResultSchema
>

export type ApiCallResult = ApiCallBase64Result | ApiCallJsonResult | ApiCallErrorResult
