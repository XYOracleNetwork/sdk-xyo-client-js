import { DivinerConfig } from '@xyo-network/diviner'
import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitnessConfig } from '@xyo-network/witness'

export interface XyoPayloadPluginParams<
  TWitnessParams extends XyoModuleParams<XyoWitnessConfig> = XyoModuleParams<XyoWitnessConfig>,
  TDivinerParams extends XyoModuleParams<DivinerConfig> = XyoModuleParams<DivinerConfig>,
> {
  diviner?: TDivinerParams
  witness?: TWitnessParams
}
