import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthersPayload } from './Payload'
import { XyoEthereumGasEthersSchema } from './Schema'
import { XyoEthereumGasEthersWitness, XyoEthereumGasEthersWitnessParams } from './Witness'

export const XyoEthereumGasEthersPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthersPayload, XyoEthereumGasEthersWitnessParams>({
    auto: true,
    schema: XyoEthereumGasEthersSchema,
    witness: async (params) => {
      return await XyoEthereumGasEthersWitness.create(assertEx(params))
    },
  })
