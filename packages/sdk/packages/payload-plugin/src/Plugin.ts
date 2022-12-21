import { Validator } from '@xyo-network/core'
import { XyoPayload, XyoPayloadBuilder } from '@xyo-network/payload'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'

export type XyoPayloadPluginFunc<TPayload extends XyoPayload = XyoPayload> = () => XyoPayloadPlugin<TPayload>

export type XyoPayloadPlugin<TPayload extends XyoPayload = XyoPayload> = {
  build?: () => XyoPayloadBuilder
  jsonSchema?: object
  schema: TPayload['schema']
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => Validator
  wrap?: (payload: XyoPayload) => PayloadWrapper
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
