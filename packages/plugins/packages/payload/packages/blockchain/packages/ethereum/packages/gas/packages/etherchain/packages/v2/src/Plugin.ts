import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema } from './Schema'

export const XyoEthereumGasEtherchainV2PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV2Payload>({
    schema: XyoEthereumGasEtherchainV2Schema,
  })
