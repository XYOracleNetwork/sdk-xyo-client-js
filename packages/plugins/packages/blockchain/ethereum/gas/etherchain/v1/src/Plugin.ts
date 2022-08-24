import { assertEx } from '@xylabs/assert'
import { createXyoPayloadPlugin, XyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'

import { XyoEthereumGasEtherchainV1WitnessConfig } from './Config'
import { XyoEthereumGasEtherchainV1Payload } from './Payload'
import { XyoEthereumGasEtherchainV1PayloadSchema } from './Schema'
import { XyoEtherchainEthereumGasWitnessV1 } from './Witness'

export const XyoIdPayloadPlugin: XyoPayloadPluginFunc<XyoEthereumGasEtherchainV1Payload, XyoEthereumGasEtherchainV1WitnessConfig> = (
  config?,
): XyoPayloadPlugin<XyoEthereumGasEtherchainV1Payload> =>
  createXyoPayloadPlugin<XyoEthereumGasEtherchainV1Payload>({
    auto: true,
    schema: XyoEthereumGasEtherchainV1PayloadSchema,
    witness: (): XyoEtherchainEthereumGasWitnessV1 => {
      return new XyoEtherchainEthereumGasWitnessV1(assertEx(config?.witness, 'Missing config'))
    },
  })
