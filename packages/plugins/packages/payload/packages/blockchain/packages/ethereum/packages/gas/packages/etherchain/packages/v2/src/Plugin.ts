import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasEtherchainV2Payload } from './Payload'
import { EthereumGasEtherchainV2Schema } from './Schema'

export const EthereumGasEtherchainV2PayloadPlugin = () =>
  createPayloadPlugin<EthereumGasEtherchainV2Payload>({
    schema: EthereumGasEtherchainV2Schema,
  })
