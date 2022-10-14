import { XyoDivinerConfig, XyoDivinerParams } from '@xyo-network/diviner'
import { XyoWitnessConfig, XyoWitnessParams } from '@xyo-network/witness'

export interface XyoPayloadPluginParams<
  TWitnessConfig extends XyoWitnessConfig = XyoWitnessConfig,
  TDivinerConfig extends XyoDivinerConfig = XyoDivinerConfig,
> {
  witness?: XyoWitnessParams & { config?: TWitnessConfig }
  diviner?: XyoDivinerParams & { config?: TDivinerConfig }
}
