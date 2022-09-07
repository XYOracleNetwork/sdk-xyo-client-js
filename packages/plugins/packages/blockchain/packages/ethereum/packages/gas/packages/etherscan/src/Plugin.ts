import { createXyoPayloadPlugin } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanSchema, XyoEthereumGasEtherscanWitnessConfigSchema } from './Schema'
import { XyoEtherscanEthereumGasWitness } from './Witness'

export const XyoEthereumGasEtherscanPayloadPlugin = () =>
  createXyoPayloadPlugin<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig>({
    auto: true,
    schema: XyoEthereumGasEtherscanSchema,
    witness: (config): XyoEtherscanEthereumGasWitness => {
      return new XyoEtherscanEthereumGasWitness({
        ...config,
        schema: XyoEthereumGasEtherscanWitnessConfigSchema,
        targetSchema: XyoEthereumGasEtherscanSchema,
      })
    },
  })
