import { EthereumGasBlocknativeSchema } from '@xyo-network/blocknative-ethereum-gas-payload-plugin'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { EthereumGasBlocknativeWitness } from './Witness'

export const EthereumGasBlocknativePlugin = () =>
  createPayloadSetWitnessPlugin<EthereumGasBlocknativeWitness>(
    { required: { [EthereumGasBlocknativeSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        return (await EthereumGasBlocknativeWitness.create(params)) as EthereumGasBlocknativeWitness
      },
    },
  )
