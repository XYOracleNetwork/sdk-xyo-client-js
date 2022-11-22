import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationV1Payload } from './Payload'
import { XyoEthereumGasEthgasstationV1WitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthgasstationV1WitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEthgasstationV1Payload,
  {
    schema: XyoEthereumGasEthgasstationV1WitnessConfigSchema
  }
>
