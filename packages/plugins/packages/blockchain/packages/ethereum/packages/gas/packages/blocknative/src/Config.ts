import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasBlocknativePayload } from './Payload'
import { XyoEthereumGasBlocknativeWitnessConfigSchema } from './Schema'

export type XyoEthereumGasBlocknativeWitnessConfig = XyoWitnessConfig<
  XyoEthereumGasBlocknativePayload,
  {
    schema: XyoEthereumGasBlocknativeWitnessConfigSchema
  }
>
