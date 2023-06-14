import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasEtherscanPayload } from './Payload'
import { EthereumGasEtherscanSchema } from './Schema'

export const EthereumGasEtherscanPayloadPlugin = () =>
  createPayloadPlugin<EthereumGasEtherscanPayload>({
    schema: EthereumGasEtherscanSchema,
  })
