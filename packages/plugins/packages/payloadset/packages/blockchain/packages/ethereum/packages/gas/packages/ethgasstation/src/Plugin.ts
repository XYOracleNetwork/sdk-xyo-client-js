import { XyoEthereumGasEthgasstationSchema } from '@xyo-network/ethgasstation-ethereum-gas-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { PayloadSetSchema } from '@xyo-network/payload-model'
import { createPayloadSetPlugin, PayloadSetWitnessPlugin } from '@xyo-network/payloadset-plugin'

import { XyoEthereumGasEthgasstationWitnessConfig } from './Config'
import { XyoEthereumGasEthgasstationWitness } from './Witness'

export const XyoEthereumGasEthgasstationPlugin = () =>
  createPayloadSetPlugin<PayloadSetWitnessPlugin<ModuleParams<XyoEthereumGasEthgasstationWitnessConfig>>>(
    { required: { [XyoEthereumGasEthgasstationSchema]: 1 }, schema: PayloadSetSchema },
    {
      witness: async (params) => {
        const result = await XyoEthereumGasEthgasstationWitness.create(params)
        return result
      },
    },
  )
