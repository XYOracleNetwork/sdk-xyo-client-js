import { EthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { EthereumGasDiviner } from './Diviner'

export const EthereumGasPlugin = () =>
  createPayloadSetDivinerPlugin<EthereumGasDiviner>(
    { required: { [EthereumGasSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return (await EthereumGasDiviner.create(params)) as EthereumGasDiviner
      },
    },
  )
