import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketWitnessConfig } from './Config'
import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'
import { XyoUniswapCryptoMarketPayloadTemplate } from './Template'
import { XyoUniswapCryptoMarketWitness } from './Witness'

export const XyoUniswapCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketWitnessConfig> = (
  config?,
) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoUniswapCryptoMarketPayloadSchema,
    template: XyoUniswapCryptoMarketPayloadTemplate,
    witness: (): XyoWitness<XyoUniswapCryptoMarketPayload> => {
      return new XyoUniswapCryptoMarketWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
