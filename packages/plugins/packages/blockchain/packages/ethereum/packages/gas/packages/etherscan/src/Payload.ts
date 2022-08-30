import { XyoPayload } from '@xyo-network/payload'

import { EtherscanGasPriceResult } from './lib'
import { XyoEthereumGasEtherscanPayloadSchema } from './Schema'

export type XyoEthereumGasEtherscanPayload = XyoPayload<
  EtherscanGasPriceResult['result'] & {
    schema: XyoEthereumGasEtherscanPayloadSchema
    timestamp: number
  }
>
