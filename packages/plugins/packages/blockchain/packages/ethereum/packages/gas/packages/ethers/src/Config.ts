import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthersWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthersWitnessConfig = XyoWitnessConfig<{
  schema: XyoEthereumGasEthersWitnessConfigSchema
}>
