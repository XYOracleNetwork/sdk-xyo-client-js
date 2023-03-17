import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationPayload } from './Payload'
import { XyoEthereumGasEthgasstationSchema } from './Schema'

export const XyoEthereumGasPayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasEthgasstationPayload>({
    schema: XyoEthereumGasEthgasstationSchema,
  })
