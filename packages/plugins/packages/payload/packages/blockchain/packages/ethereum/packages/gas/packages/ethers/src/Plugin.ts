import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema } from './Schema'

export const XyoEthereumGasEthersPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthersPayload>({
    schema: XyoEthereumGasEthersSchema,
  })
