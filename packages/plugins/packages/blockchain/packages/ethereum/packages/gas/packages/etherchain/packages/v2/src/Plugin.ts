import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2PayloadSchema, XyoEthereumGasEtherchainV2WitnessConfigSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEtherchainV2PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2WitnessConfig>({
    auto: true,
    schema: XyoEthereumGasEtherchainV2PayloadSchema,
    witness: (config): XyoEtherchainEthereumGasWitnessV2 => {
      return new XyoEtherchainEthereumGasWitnessV2({
        ...config,
        schema: XyoEthereumGasEtherchainV2WitnessConfigSchema,
        targetSchema: XyoEthereumGasEtherchainV2PayloadSchema,
      })
    },
  })
