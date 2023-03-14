import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasDiviner } from './Diviner'

export const XyoEthereumGasPlugin = () =>
  createPayloadSetDivinerPlugin<XyoEthereumGasDiviner>(
    { required: { [XyoEthereumGasSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return (await XyoEthereumGasDiviner.create(params)) as XyoEthereumGasDiviner
      },
    },
  )
