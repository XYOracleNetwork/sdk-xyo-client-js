import { XyoPayload } from '@xyo-network/payload'

import { EtherscanGasPriceResult } from './lib'
import { XyoEthereumGasEtherscanSchema } from './Schema'

export type XyoEthereumGasEtherscanPayload = XyoPayload<
  EtherscanGasPriceResult['result'] & {
    schema: XyoEthereumGasEtherscanSchema
    timestamp: number
  }
>
