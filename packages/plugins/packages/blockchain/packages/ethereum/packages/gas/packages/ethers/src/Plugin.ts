import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersWitnessConfig } from './Config'
import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema } from './Schema'
import { XyoEthereumGasEthersWitness } from './Witness'

export const XyoEthereumGasEthersPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthersPayload, XyoModuleParams<XyoEthereumGasEthersWitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEthersSchema,
    witness: async (params) => {
      return await XyoEthereumGasEthersWitness.create(params)
    },
  })
