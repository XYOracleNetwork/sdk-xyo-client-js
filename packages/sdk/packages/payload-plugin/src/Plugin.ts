import { XyoValidator } from '@xyo-network/core'
import { XyoDiviner, XyoDivinerConfig } from '@xyo-network/diviner'
import { PartialModuleConfig } from '@xyo-network/module'
import { PayloadWrapper, XyoPayload } from '@xyo-network/payload'
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
  TDivinerConfig extends XyoDivinerConfig = XyoDivinerConfig,
> = {
  configs?: XyoPayloadPluginConfigs<TWitnessConfig, TDivinerConfig>
  schema: TPayload['schema']
  auto?: boolean
  template?: () => Partial<TPayload>
  validate?: (payload: XyoPayload) => XyoValidator
  wrap?: (payload: XyoPayload) => PayloadWrapper
  witness?: <T extends PartialWitnessConfig<TWitnessConfig>>(config: T) => XyoWitness
  diviner?: <T extends PartialModuleConfig<TDivinerConfig>>(config: T) => XyoDiviner
}

/* Note: We use PartialWitnessConfig to allow people to config witnesses without having to pass in all the schema info*/
