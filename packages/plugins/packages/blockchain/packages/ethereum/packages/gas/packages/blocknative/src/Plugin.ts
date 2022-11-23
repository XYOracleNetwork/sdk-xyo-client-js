import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { XyoEthereumGasBlocknativePayload } from './Payload'
import { XyoEthereumGasBlocknativeSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

export const XyoEthereumGasBlocknativePayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasBlocknativePayload, XyoModuleParams<XyoEthereumGasBlocknativeWitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasBlocknativeSchema,
    witness: async (params) => {
      return await XyoEthereumGasBlocknativeWitness.create(params)
    },
  })
