import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV2WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV2Payload } from './Payload'
import { XyoEthereumGasEtherchainV2PayloadSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV2 } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<XyoEthereumGasEtherchainV2Payload, XyoEthereumGasEtherchainV2WitnessConfig> = (
  config?,
): XyoPayloadPlugin<XyoEthereumGasEtherchainV2Payload> =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV2Payload>({
    auto: true,
    schema: XyoEthereumGasEtherchainV2PayloadSchema,
    witness: (): XyoEtherchainEthereumGasWitnessV2 => {
      return new XyoEtherchainEthereumGasWitnessV2(assertEx(config?.witness, 'Missing config'))
    },
  })
