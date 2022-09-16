import { XyoDivinerConfig } from '@xyo-network/diviner'
import { PartialModuleConfig } from '@xyo-network/module'
import { PartialWitnessConfig, XyoWitnessConfig } from '@xyo-network/witness'

export interface XyoPayloadPluginConfigs<
  TWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TDivinerConfig extends XyoDivinerConfig = XyoDivinerConfig,
> {
  witness?: PartialWitnessConfig<TWitnessConfig>
  diviner?: PartialModuleConfig<TDivinerConfig>
}
