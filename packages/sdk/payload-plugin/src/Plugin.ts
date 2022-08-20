import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

export interface XyoPayloadPluginConfig<
  TTargetSchema extends string,
  TWitnessConfigSchema extends string = 'network.xyo.witness.config',
  TPayloadWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig<{
    schema: TWitnessConfigSchema
    targetSchema: TTargetSchema
  }>,
  TDivinerConfigSchema extends string = 'network.xyo.diviner.config',
  TPayloadDivinerConfig extends XyoWitnessConfig<{ schema: TDivinerConfigSchema; targetSchema: TTargetSchema }> = XyoWitnessConfig<{
    schema: TDivinerConfigSchema
    targetSchema: TTargetSchema
  }>,
> {
  witness?: TPayloadWitnessConfig
  diviner?: TPayloadDivinerConfig
}

export type XyoPayloadPluginFunc<
  TPayloadSchema extends string,
  TPayload extends XyoPayload<{ schema: TPayloadSchema }> = XyoPayload<{ schema: TPayloadSchema }>,
  TWitnessConfigSchema extends string = 'network.xyo.witness.config',
  TConfig extends XyoPayloadPluginConfig<TPayloadSchema, TWitnessConfigSchema> = XyoPayloadPluginConfig<TPayloadSchema, TWitnessConfigSchema>,
> = (config?: TConfig) => XyoPayloadPlugin<TPayloadSchema, TPayload>

export type XyoPayloadPlugin<TSchema extends string, TPayload extends XyoPayload = XyoPayload> = {
  schema: TSchema
  auto?: boolean
  template?: () => Partial<TPayload>
  validate: (payload: XyoPayload) => XyoValidator
  wrap: (payload: XyoPayload) => XyoPayloadWrapper
  witness?: () => XyoWitness
  diviner?: () => XyoDiviner
}
