import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { EthereumGasBlocknativePayload } from './Payload'
import { EthereumGasBlocknativeSchema } from './Schema'

export const EthereumGasBlocknativePayloadPlugin = () =>
  createPayloadPlugin<EthereumGasBlocknativePayload>({
    schema: EthereumGasBlocknativeSchema,
  })
