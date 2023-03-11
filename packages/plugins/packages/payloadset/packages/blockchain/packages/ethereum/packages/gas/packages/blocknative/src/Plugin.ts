import { XyoEthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasBlocknativeWitness } from './Witness'

export const XyoEthereumGasBlocknativePlugin = () =>
  createPayloadSetWitnessPlugin<XyoEthereumGasBlocknativeWitness>(
    { required: { [XyoEthereumGasBlocknativeSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await XyoEthereumGasBlocknativeWitness.create(params)) as XyoEthereumGasBlocknativeWitness
      },
    },
  )
