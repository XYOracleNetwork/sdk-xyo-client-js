import { XyoCryptoMarketUniswapPayload, XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessConfig } from '@xyo-network/cryptomarket-witness'
import { XyoPayloadValidator, XyoPayloadWrapper } from '@xyo-network/payload'
import { createXyoPayloadPlugin, XyoPayloadPlugin } from '@xyo-network/payload-plugin'

const plugin: XyoPayloadPlugin<'network.xyo.crypto.market.uniswap', XyoCryptoMarketUniswapPayload, XyoUniswapCryptoMarketWitnessConfig> =
  createXyoPayloadPlugin<'network.xyo.crypto.market.uniswap', XyoCryptoMarketUniswapPayload, XyoUniswapCryptoMarketWitnessConfig>({
    schema: 'network.xyo.crypto.market.uniswap',
    validate: function (payload: XyoCryptoMarketUniswapPayload): XyoPayloadValidator<XyoCryptoMarketUniswapPayload> {
      return new XyoPayloadValidator(payload)
    },
    witness: function (config?: XyoUniswapCryptoMarketWitnessConfig): XyoUniswapCryptoMarketWitness {
      return new XyoUniswapCryptoMarketWitness(config)
    },
    wrap: function (payload: XyoCryptoMarketUniswapPayload): XyoPayloadWrapper<XyoCryptoMarketUniswapPayload> {
      return new XyoPayloadWrapper(payload)
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
