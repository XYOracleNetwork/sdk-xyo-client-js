import { XyoCryptoMarketUniswapPayload, XyoUniswapCryptoMarketWitness, XyoUniswapCryptoMarketWitnessConfig } from '@xyo-network/cryptomarket-witness'
import { createXyoPayloadPlugin, XyoPayloadPluginConfig, XyoPayloadPluginFunc } from '@xyo-network/payload-plugin'
import { XyoWitness } from '@xyo-network/witness'

const plugin: XyoPayloadPluginFunc<
  'network.xyo.crypto.market.uniswap',
  XyoCryptoMarketUniswapPayload,
  XyoPayloadPluginConfig<XyoUniswapCryptoMarketWitnessConfig>
> = (config?) =>
  createXyoPayloadPlugin({
    schema: 'network.xyo.crypto.market.uniswap',
    witness: (): XyoWitness => {
      return new XyoUniswapCryptoMarketWitness(config?.witness)
    },
  })

// eslint-disable-next-line import/no-default-export
export default plugin
