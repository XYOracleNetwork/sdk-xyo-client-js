import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasBlocknativePayload } from './Payload'
import { XyoEthereumGasBlocknativeSchema } from './Schema'

export const XyoEthereumGasBlocknativePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasBlocknativePayload>({
    schema: XyoEthereumGasBlocknativeSchema,
  })
