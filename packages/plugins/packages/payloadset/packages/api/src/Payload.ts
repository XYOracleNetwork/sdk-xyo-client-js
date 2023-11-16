import { Hash } from '@xyo-network/hash'
import { AsObjectFactory } from '@xyo-network/object'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'

export const ApiCallSchema = 'network.xyo.api.call'
export type ApiCallSchema = typeof ApiCallSchema

type Verb = 'get' | 'post'
type Queries = Record<string, string>

export interface ApiCallFields {
  queries?: Queries
  verb?: Verb
}

export type ApiUriCall = Payload<
  ApiCallFields & {
    uri: string
  },
  ApiCallSchema
>

export type ApiUriTemplateCall = Payload<
  ApiCallFields & {
    params?: Record<string, unknown>
    uriTemplate?: string
  },
  ApiCallSchema
>

export type ApiCall = ApiUriCall | ApiUriTemplateCall

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

export const isApiCall = isPayloadOfSchemaType(ApiCallSchema)
export const asApiCall = AsObjectFactory.create(isApiCall)

export const isApiUriCall = (payload?: Payload): payload is ApiUriCall => isApiCall(payload) && !!(payload as ApiUriCall).uri
export const asApiUriCall = AsObjectFactory.create(isApiUriCall)

export const isApiUriTemplateCall = (payload?: Payload): payload is ApiUriTemplateCall =>
  isApiCall(payload) && !!((payload as ApiUriTemplateCall).uriTemplate || (payload as ApiUriTemplateCall).params)
export const asApiUriTemplateCall = AsObjectFactory.create(isApiUriTemplateCall)
