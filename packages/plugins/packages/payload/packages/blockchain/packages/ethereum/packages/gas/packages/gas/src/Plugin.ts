import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
import { ethereumGasPayloadTemplate } from './Template'

export const XyoEthereumGasPayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasPayload>({
    schema: XyoEthereumGasSchema,
    template: ethereumGasPayloadTemplate,
  })
