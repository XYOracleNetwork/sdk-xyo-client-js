import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1Schema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

export const XyoEthereumGasEtherchainV1PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1WitnessConfig>({
    auto: true,
    schema: XyoEthereumGasEtherchainV1Schema,
    witness: async (params) => {
      return await XyoEtherchainEthereumGasWitnessV1.create(params)
    },
  })
