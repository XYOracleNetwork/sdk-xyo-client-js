import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema } from './Schema'

export const XyoEthereumGasEthersPayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasEthersPayload>({
    schema: XyoEthereumGasEthersSchema,
  })
