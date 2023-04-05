import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2Schema } from './Schema'

export const XyoEthereumGasEtherchainV2PayloadPlugin = () =>
  createPayloadPlugin<XyoEthereumGasEtherchainV2Payload>({
    schema: XyoEthereumGasEtherchainV2Schema,
  })
