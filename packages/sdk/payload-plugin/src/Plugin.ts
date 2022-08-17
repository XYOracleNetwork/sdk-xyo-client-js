import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

export interface XyoPayloadPluginConfig<
  TPayloadWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TPayloadDivinerConfig extends XyoWitnessConfig = XyoWitnessConfig,
> {
  witness?: TPayloadWitnessConfig
  diviner?: TPayloadDivinerConfig
}

export type XyoPayloadPluginFunc<
  TSchema extends string,
  TPayload extends XyoPayload = XyoPayload,
  TConfig extends XyoPayloadPluginConfig = XyoPayloadPluginConfig,
> = (config?: TConfig) => XyoPayloadPlugin<TSchema, TPayload>

export type XyoPayloadPlugin<TSchema extends string, TPayload extends XyoPayload = XyoPayload> = {
  schema: TSchema
  auto?: boolean
  template?: () => Partial<TPayload>
  validate: (payload: XyoPayload) => XyoValidator
  wrap: (payload: XyoPayload) => XyoPayloadWrapper
  witness?: () => XyoWitness
  diviner?: () => XyoDiviner
}
