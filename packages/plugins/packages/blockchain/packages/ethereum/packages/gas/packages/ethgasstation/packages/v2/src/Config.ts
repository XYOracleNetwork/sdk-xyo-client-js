import { XyoWitnessConfig } from '@xyo-network/witness'

import { XyoEthereumGasEthgasstationV2Payload } from './Payload'
import { XyoEthereumGasEthgasstationV2WitnessConfigSchema } from './Schema'

export type XyoEthereumGasEthgasstationV2WitnessConfig = XyoWitnessConfig<
  XyoEthereumGasEthgasstationV2Payload,
  {
    schema: XyoEthereumGasEthgasstationV2WitnessConfigSchema
  }
>
