import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationV1WitnessConfig } from './Config'
import { XyoEthereumGasEthgasstationV1Payload } from './Payload'
import { XyoEthereumGasEthgasstationV1Schema } from './Schema'
import { XyoEthgasstationEthereumGasWitnessV1 } from './Witness'

export const XyoEthereumGasEthgasstationV1PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthgasstationV1Payload, XyoModuleParams<XyoEthereumGasEthgasstationV1WitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEthgasstationV1Schema,
    witness: async (params) => {
      return await XyoEthgasstationEthereumGasWitnessV1.create(params)
    },
  })
