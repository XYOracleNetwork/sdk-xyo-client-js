import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherscanWitnessConfig } from './Config'
import { XyoEthereumGasEtherscanPayload } from './Payload'
import { XyoEthereumGasEtherscanPayloadSchema } from './Schema'
import { XyoEtherscanEthereumGasWitness } from './Witness'

export const XyoEthereumGasEtherscanPayloadPlugin: XyoPayloadPluginFunc<XyoEthereumGasEtherscanPayload, XyoEthereumGasEtherscanWitnessConfig> = (
  config?,
): XyoPayloadPlugin<XyoEthereumGasEtherscanPayload> =>
  createXyoPayloadPlugin<XyoEthereumGasEtherscanPayload>({
    auto: true,
    schema: XyoEthereumGasEtherscanPayloadSchema,
    witness: (): XyoEtherscanEthereumGasWitness => {
      return new XyoEtherscanEthereumGasWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
