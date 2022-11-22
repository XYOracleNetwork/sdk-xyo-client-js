import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { XyoEthereumGasEthgasstationPayload } from './Payload'
import { XyoEthereumGasEthgasstationSchema } from './Schema'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

export const XyoEthereumGasEthgasstationPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthgasstationPayload, XyoModuleParams<XyoEthereumGasEthgasstationWitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEthgasstationSchema,
    witness: async (params) => {
      return await XyoEthereumGasEthgasstationWitness.create(params)
    },
  })
