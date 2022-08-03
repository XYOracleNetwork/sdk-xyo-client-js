import { XyoCryptoMarketUniswapPayload, XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessConfig } from '@xyo-network/cryptomarket-witness'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCryptoMarketUniswapPayloadSchema } from './Schema'
import { XyoCryptoMarketUniswapPayloadTemplate } from './Template'

export const XyoUniswapCryptoMarketPayloadPlugin: XyoPayloadPluginFunc<
  XyoCryptoMarketUniswapPayloadSchema,
  XyoCryptoMarketUniswapPayload,
  XyoPayloadPluginConfig<XyoUniswapCryptoMarketWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    auto: true,
    schema: XyoCryptoMarketUniswapPayloadSchema,
    template: XyoCryptoMarketUniswapPayloadTemplate,
    witness: (): XyoWitness => {
      return new XyoUniswapCryptoMarketWitness(config?.witness)
    },
  })
