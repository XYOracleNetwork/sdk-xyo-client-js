import { XyoEthereumGasSchema } from '@xyo-network/gas-price-payload-plugin'
import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetDivinerPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasDiviner, XyoEthereumGasDivinerConfig } from './Diviner'

export const XyoEthereumGasPlugin = () =>
  createPayloadSetPlugin<PayloadSetDivinerPlugin<XyoModuleParams<XyoEthereumGasDivinerConfig>>>(
    { required: { [XyoEthereumGasSchema]: 1 }, schema: PayloadSetSchema },
    {
      diviner: async (params) => {
        return await XyoEthereumGasDiviner.create(params)
      },
    },
  )
