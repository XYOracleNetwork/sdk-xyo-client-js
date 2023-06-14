import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasEthgasstationPayload } from './Payload'
import { EthereumGasEthgasstationSchema } from './Schema'

export const EthereumGasPayloadPlugin = () =>
  createPayloadPlugin<EthereumGasEthgasstationPayload>({
    schema: EthereumGasEthgasstationSchema,
  })
