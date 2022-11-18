import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasDiviner } from './Diviner'
import { XyoEthereumGasPayload } from './Payload'
import { XyoEthereumGasDivinerConfigSchema, XyoEthereumGasSchema } from './Schema'
import { XyoEthereumGasPayloadTemplate } from './Template'

export const XyoEthereumGasPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasPayload>({
    auto: true,
    diviner: async (config) => {
      const diviner = await XyoEthereumGasDiviner.create({
        config: {
          ...config,
          schema: XyoEthereumGasDivinerConfigSchema,
          targetSchema: XyoEthereumGasSchema,
        },
      })
      return diviner
    },
    schema: XyoEthereumGasSchema,
    template: XyoEthereumGasPayloadTemplate,
  })
