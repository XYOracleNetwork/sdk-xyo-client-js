import { AsObjectFactory } from '@xyo-network/object'
import { isPayloadOfSchemaType, Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

import { ApiCall, ApiUriCall, ApiUriTemplateCall } from './Payload'

export const ApiCallWitnessConfigSchema = 'network.xyo.api.call.witness.config'
export type ApiCallWitnessConfigSchema = typeof ApiCallWitnessConfigSchema

export type ApiCallWitnessConfigBase = WitnessConfig<{
  accept?: 'application/json'
  queries?: ApiCall['queries']
  schema: ApiCallWitnessConfigSchema
  timeout?: number
  verb?: ApiCall['verb']
}>

export type ApiUriCallWitnessConfig = WitnessConfig<
  ApiCallWitnessConfigBase & {
    uri: ApiUriCall['uri']
  }
>

export type ApiUriTemplateCallWitnessConfig = WitnessConfig<
  ApiCallWitnessConfigBase & {
    params?: Record<string, unknown>
    uriTemplate: ApiUriTemplateCall['uriTemplate']
  }
>

export type ApiCallWitnessConfig = ApiUriCallWitnessConfig | ApiUriTemplateCallWitnessConfig | ApiCallWitnessConfigBase

export const isApiCallWitnessConfig = isPayloadOfSchemaType(ApiCallWitnessConfigSchema)
export const asApiCallWitnessConfig = AsObjectFactory.create(isApiCallWitnessConfig)

export const isApiUriCallWitnessConfig = (payload?: Payload): payload is ApiUriCallWitnessConfig =>
  isApiCallWitnessConfig(payload) && !!(payload as ApiUriCallWitnessConfig).uri
export const asApiUriCallWitnessConfig = AsObjectFactory.create(isApiUriCallWitnessConfig)

export const isApiUriTemplateCallWitnessConfig = (payload?: Payload): payload is ApiUriTemplateCallWitnessConfig =>
  isApiCallWitnessConfig(payload) && !!(payload as ApiUriTemplateCallWitnessConfig).uriTemplate
export const asApiUriTemplateCallWitnessConfig = AsObjectFactory.create(isApiUriTemplateCallWitnessConfig)
