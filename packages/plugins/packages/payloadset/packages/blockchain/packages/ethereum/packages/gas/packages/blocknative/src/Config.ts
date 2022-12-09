import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type XyoEthereumGasBlocknativeWitnessConfig = XyoWitnessConfig<{
  schema: XyoEthereumGasBlocknativeWitnessConfigSchema
}>
