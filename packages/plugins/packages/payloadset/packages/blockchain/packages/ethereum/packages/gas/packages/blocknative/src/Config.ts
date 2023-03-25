import { WitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type XyoEthereumGasBlocknativeWitnessConfig = WitnessConfig<{
  schema: XyoEthereumGasBlocknativeWitnessConfigSchema
}>
