import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoDiviner, XyoDivinerDivineQuerySchema } from '@xyo-network/diviner'
import { XyoPayloads } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'

export class XyoCryptoMarketAssetDiviner extends XyoDiviner {
  override queries() {
    return [XyoDivinerDivineQuerySchema, ...super.queries()]
  }

  public override divine(payloads?: XyoPayloads): Promisable<XyoPayloads> {
    const coinGeckoPayload = payloads?.find((payload) => payload?.schema === XyoCoingeckoCryptoMarketSchema) as XyoCoingeckoCryptoMarketPayload
    const uniswapPayload = payloads?.find((payload) => payload?.schema === XyoUniswapCryptoMarketSchema) as XyoUniswapCryptoMarketPayload
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    return [result]
  }
}
