import { assertEx } from '@xylabs/sdk-js'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

import { XyoUniswapCryptoMarketPayload } from './Payload'
import { XyoUniswapCryptoMarketPayloadSchema } from './Schema'
import { XyoUniswapCryptoMarketPayloadTemplate } from './Template'
import { XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessConfig } from './Witness'

export const XyoUniswapCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoUniswapCryptoMarketPayloadSchema,
  XyoUniswapCryptoMarketPayload,
  XyoPayloadPluginConfig<XyoUniswapCryptoMarketWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoUniswapCryptoMarketPayloadSchema,
    template: XyoUniswapCryptoMarketPayloadTemplate,
    witness: (): XyoWitness => {
      return new XyoUniswapCryptoMarketWitness(assertEx(config?.witness, 'Missing config'))
    },
  })
