import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasPayload } from './Payload'
import { EthereumGasSchema } from './Schema'
import { ethereumGasPayloadTemplate } from './Template'

export const EthereumGasPayloadPlugin = () =>
  createPayloadPlugin<EthereumGasPayload>({
    schema: EthereumGasSchema,
    template: ethereumGasPayloadTemplate,
  })
