import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessConfigSchema } from '@xyo-network/witness'

export type XyoPayloadPluginConfig<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfigSchema extends string = XyoWitnessConfigSchema,
  TPayloadWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig<{
    schema: TWitnessConfigSchema
    targetSchema: TPayload['schema']
  }>,
  TDivinerConfigSchema extends string = XyoDivinerConfigSchema,
  TPayloadDivinerConfig extends XyoWitnessConfig = XyoWitnessConfig<{
    schema: TDivinerConfigSchema
    targetSchema: TPayload['schema']
  }>,
> = XyoPayload<{
  witness?: TPayloadWitnessConfig
  diviner?: TPayloadDivinerConfig
}>

export type XyoPayloadPluginFunc<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfigSchema extends string = XyoWitnessConfigSchema,
  TConfig extends XyoPayloadPluginConfig<TPayload, TWitnessConfigSchema> = XyoPayloadPluginConfig<TPayload, TWitnessConfigSchema>,
> = (config?: TConfig) => XyoPayloadPlugin<TPayload>

export type XyoPayloadPlugin<TPayload extends XyoPayload = XyoPayload> = {
  schema: TPayload['schema']
  auto?: boolean
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => XyoValidator
  wrap?: (payload: XyoPayload) => XyoPayloadWrapper
  witness?: () => XyoWitness
  diviner?: () => XyoDiviner
}
