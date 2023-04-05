import { WitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthersWitnessConfig = WitnessConfig<{
  schema: XyoEthereumGasEthersWitnessConfigSchema
}>
