import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1Schema } from './Schema'

export const XyoEthereumGasEtherchainV1PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV1Payload>({
    schema: XyoEthereumGasEtherchainV1Schema,
  })
