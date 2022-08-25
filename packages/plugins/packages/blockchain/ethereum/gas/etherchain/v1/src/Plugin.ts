import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1PayloadSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

export const XyoEthereumGasEtherchainV1PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1WitnessConfig>({
    auto: true,
    schema: XyoEthereumGasEtherchainV1PayloadSchema,
    witness: (config) => {
      return new XyoEtherchainEthereumGasWitnessV1(config)
    },
  })
