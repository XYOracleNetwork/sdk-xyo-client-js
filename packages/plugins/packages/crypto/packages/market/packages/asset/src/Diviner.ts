import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketPayloadSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'
import { XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketPayloadSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'

export class XyoCryptoMarketAssetDiviner extends XyoDiviner<XyoCryptoMarketAssetPayload> {
  get queries() {
    return [XyoDivinerDivineQuerySchema]
  }

  public override divine(payloads?: XyoPayloads): Promisable<XyoCryptoMarketAssetPayload | null> {
    const coinGeckoPayload = payloads?.find((payload) => payload?.schema === XyoCoingeckoCryptoMarketPayloadSchema) as XyoCoingeckoCryptoMarketPayload
    const uniswapPayload = payloads?.find((payload) => payload?.schema === XyoUniswapCryptoMarketPayloadSchema) as XyoUniswapCryptoMarketPayload
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    return result
  }
}
