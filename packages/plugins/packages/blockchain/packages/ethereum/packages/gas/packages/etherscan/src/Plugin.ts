import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema } from './Schema'
import { XyoEthereumGasEtherscanWitness } from './Witness'

export const XyoEthereumGasEtherscanPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherscanPayload, XyoModuleParams<XyoEthereumGasEtherscanWitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEtherscanSchema,
    witness: async (params) => {
      return await XyoEthereumGasEtherscanWitness.create(params)
    },
  })
