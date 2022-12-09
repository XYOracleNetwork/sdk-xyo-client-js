import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationPayload } from './Payload'
import { XyoEthereumGasEthgasstationSchema } from './Schema'

export const XyoEthereumGasPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthgasstationPayload>({
    schema: XyoEthereumGasEthgasstationSchema,
  })
