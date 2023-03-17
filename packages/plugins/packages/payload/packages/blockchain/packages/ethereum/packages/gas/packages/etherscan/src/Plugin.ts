import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema } from './Schema'

export const XyoEthereumGasEtherscanPayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasEtherscanPayload>({
    schema: XyoEthereumGasEtherscanSchema,
  })
