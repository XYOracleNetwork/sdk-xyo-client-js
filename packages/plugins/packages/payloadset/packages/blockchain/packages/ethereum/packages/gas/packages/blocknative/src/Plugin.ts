import { XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasBlocknativeWitnessConfig } from './Config'
import { XyoEthereumGasBlocknativeWitness } from './Witness'

export const XyoEthereumGasBlocknativePlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoEthereumGasBlocknativeWitnessConfig>>>(
    { required: { [XyoEthereumGasBlocknativeSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasBlocknativeWitness.create(params)
        return result
      },
    },
  )
