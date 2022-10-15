import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema } from './Schema'
import { XyoEtherscanEthereumGasWitness } from './Witness'

export const XyoEthereumGasEtherscanPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig>({
    auto: true,
    schema: XyoEthereumGasEtherscanSchema,
    witness: async (params) => {
      return await new XyoEtherscanEthereumGasWitness(params).start()
    },
  })
