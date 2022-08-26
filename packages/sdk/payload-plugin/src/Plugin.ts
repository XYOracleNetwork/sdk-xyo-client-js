import { XyoValidator } from '@xyo-network/core'
import { PartialDivinerConfig, XyoDiviner, XyoDivinerConfig } from '@xyo-network/diviner'
import { XyoPayload, XyoPayloadWrapper } from '@xyo-network/payload'
import { PartialWitnessConfig, XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoPayloadPluginConfigs } from './XyoPayloadPluginConfigs'

export type XyoPayloadPluginFunc<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> = XyoWitnessConfig<TPayload>,
  TDivinerConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
> = () => XyoPayloadPlugin<TPayload, TWitnessConfig, TDivinerConfig>

export type XyoPayloadPlugin<
  TPayload extends XyoPayload = XyoPayload,
  TWitnessConfig extends XyoWitnessConfig<TPayload> = XyoWitnessConfig<TPayload>,
  TDivinerConfig extends XyoDivinerConfig<TPayload> = XyoDivinerConfig<TPayload>,
> = {
  configs?: XyoPayloadPluginConfigs<TWitnessConfig, TDivinerConfig>
  schema: TPayload['schema']
  auto?: boolean
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => XyoValidator
  wrap?: (payload: XyoPayload) => XyoPayloadWrapper
  witness?: <T extends PartialWitnessConfig<TWitnessConfig>>(config: T) => XyoWitness
  diviner?: <T extends PartialDivinerConfig<TDivinerConfig>>(config: T) => XyoDiviner
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
