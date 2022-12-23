import { DivinerConfig } from '@xyo-network/diviner-model'
import { ModuleParams } from '@xyo-network/module'
import { XyoWitnessConfig } from '@xyo-network/witness'

export interface PayloadSetPluginParams<
  TWitnessParams extends ModuleParams<XyoWitnessConfig> = ModuleParams<XyoWitnessConfig>,
  TDivinerParams extends ModuleParams<DivinerConfig> = ModuleParams<DivinerConfig>,
> {
  diviner?: TDivinerParams
  witness?: TWitnessParams
}
