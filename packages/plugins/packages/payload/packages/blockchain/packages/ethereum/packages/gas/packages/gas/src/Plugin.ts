import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasSchema } from './Schema'
import { ethereumGasPayloadTemplate } from './Template'

export const XyoEthereumGasPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasPayload>({
    schema: XyoEthereumGasSchema,
    template: ethereumGasPayloadTemplate,
  })
