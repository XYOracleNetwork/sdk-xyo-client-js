import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner, XyoDivinerConfigSchema } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig, XyoWitnessConfigSchema } from '@xyo-network/witness'

export interface XyoPayloadPluginConfig<
  TTargetSchema extends string,
  TWitnessConfigSchema extends string = XyoWitnessConfigSchema,
  TPayloadWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig<
    TTargetSchema,
    {
      schema: TWitnessConfigSchema
    }
  >,
  TDivinerConfigSchema extends string = XyoDivinerConfigSchema,
  TPayloadDivinerConfig extends XyoWitnessConfig<TTargetSchema, { schema: TDivinerConfigSchema }> = XyoWitnessConfig<
    TTargetSchema,
    {
      schema: TDivinerConfigSchema
    }
  >,
> {
  witness?: TPayloadWitnessConfig
  diviner?: TPayloadDivinerConfig
}

export type XyoPayloadPluginFunc<
  TPayloadSchema extends string,
  TPayload extends XyoPayload<{ schema: TPayloadSchema }> = XyoPayload<{ schema: TPayloadSchema }>,
  TWitnessConfigSchema extends string = XyoWitnessConfigSchema,
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
