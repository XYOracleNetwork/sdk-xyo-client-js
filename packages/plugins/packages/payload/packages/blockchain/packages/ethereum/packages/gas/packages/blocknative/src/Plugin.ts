import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasBlocknativePayload } from './Payload'
import { XyoEthereumGasBlocknativeSchema } from './Schema'

export const XyoEthereumGasBlocknativePayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasBlocknativePayload>({
    schema: XyoEthereumGasBlocknativeSchema,
  })
