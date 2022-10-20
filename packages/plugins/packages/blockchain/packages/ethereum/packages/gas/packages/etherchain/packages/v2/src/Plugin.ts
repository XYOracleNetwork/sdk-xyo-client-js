import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEtherchainV2PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV2Payload, XyoModuleParams<XyoEthereumGasEtherchainV2WitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEtherchainV2Schema,
    witness: async (params) => {
      return await XyoEtherchainEthereumGasWitnessV2.create(params)
    },
  })
