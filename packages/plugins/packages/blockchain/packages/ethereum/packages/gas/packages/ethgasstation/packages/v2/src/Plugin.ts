import { XyoModuleParams } from '@xyo-network/module'
import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEthgasstationV2WitnessConfig } from './Config'
import { XyoEthereumGasEthgasstationV2Payload } from './Payload'
import { XyoEthereumGasEthgasstationV2Schema } from './Schema'
import { XyoEthgasstationEthereumGasWitnessV2 } from './Witness'

export const XyoEthereumGasEthgasstationV2PayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEthgasstationV2Payload, XyoModuleParams<XyoEthereumGasEthgasstationV2WitnessConfig>>({
    auto: true,
    schema: XyoEthereumGasEthgasstationV2Schema,
    witness: async (params) => {
      return await XyoEthgasstationEthereumGasWitnessV2.create(params)
    },
  })
