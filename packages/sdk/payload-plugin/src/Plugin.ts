import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner, XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

export type XyoPayloadPluginConfig<
  TTargetPayload extends XyoPayload = XyoPayload,
  TPayloadWitnessConfig extends XyoWitnessConfig<TTargetPayload> | void = void,
  TPayloadDivinerConfig extends XyoDivinerConfig<TTargetPayload> | void = void,
> = XyoPayload<{
  witness?: TPayloadWitnessConfig
  diviner?: TPayloadDivinerConfig
}>

export type XyoPayloadPluginFunc<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> | void = void,
  TDivinerConfig extends XyoDivinerConfig<TPayload> | void = void,
> = (config?: XyoPayloadPluginConfig<TPayload, TWitnessConfig, TDivinerConfig>) => XyoPayloadPlugin<TPayload>

export type XyoPayloadPlugin<TPayload extends XyoPayload = XyoPayload> = {
  schema: TPayload['schema']
  auto?: boolean
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => XyoValidator
  wrap?: (payload: XyoPayload) => XyoPayloadWrapper
  witness?: () => XyoWitness
  diviner?: () => XyoDiviner
}
