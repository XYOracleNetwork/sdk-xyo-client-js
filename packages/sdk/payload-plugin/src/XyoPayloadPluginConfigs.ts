import { PartialDivinerConfig, XyoDivinerConfig } from '@xyo-network/diviner'
import { PartialWitnessConfig, XyoWitnessConfig } from '@xyo-network/witness'

export interface XyoPayloadPluginConfigs<
  TWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TDivinerConfig extends XyoDivinerConfig = XyoDivinerConfig,
> {
  witness?: PartialWitnessConfig<TWitnessConfig>
  diviner?: PartialDivinerConfig<TDivinerConfig>
}
