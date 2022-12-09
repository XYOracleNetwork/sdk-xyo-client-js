import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema } from './Schema'

export const XyoEthereumGasEtherscanPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherscanPayload>({
    schema: XyoEthereumGasEtherscanSchema,
  })
