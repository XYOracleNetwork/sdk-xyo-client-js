import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasEthersPayload } from './Payload'
import { EthereumGasEthersSchema } from './Schema'

export const EthereumGasEthersPayloadPlugin = () =>
  createPayloadPlugin<EthereumGasEthersPayload>({
    schema: EthereumGasEthersSchema,
  })
