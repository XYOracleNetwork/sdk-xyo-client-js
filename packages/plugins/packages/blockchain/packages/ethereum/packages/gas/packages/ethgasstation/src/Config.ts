import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationPayload } from './Payload'
import { XyoEthereumGasEthgasstationWitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthgasstationWitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEthgasstationPayload,
  {
    schema: XyoEthereumGasEthgasstationWitnessConfigSchema
  }
>
