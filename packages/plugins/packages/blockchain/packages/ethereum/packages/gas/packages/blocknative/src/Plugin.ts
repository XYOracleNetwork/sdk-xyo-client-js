import { XyoModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { XyoEthereumGasBlocknativeSchema } from './Schema'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

export const XyoEthereumGasBlocknativePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<XyoModuleParams<XyoEthereumGasBlocknativeWitnessConfig>>>(
    { required: { [XyoEthereumGasBlocknativeSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasBlocknativeWitness.create(params)
        return result
      },
    },
  )
