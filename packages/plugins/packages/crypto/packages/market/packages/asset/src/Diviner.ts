import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketPayloadSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoAbstractDiviner, XyoDivinerQueryPayload, XyoDivinerQueryPayloadSchema } from '@xyo-network/diviner'
import { XyoModuleQueryResult } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'
import { XyoUniswapCryptoMarketPayload, XyoUniswapCryptoMarketPayloadSchema } from '@xyo-network/uniswap-crypto-market-payload-plugin'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'

export class XyoCryptoMarketAssetDiviner extends XyoAbstractDiviner {
  get queries(): string[] {
    return [XyoDivinerQueryPayloadSchema]
  }
  query(query: XyoDivinerQueryPayload): Promisable<XyoModuleQueryResult<XyoCryptoMarketAssetPayload>> {
    const coinGeckoPayload = query.payloads.find(
      (payload) => payload.schema === XyoCoingeckoCryptoMarketPayloadSchema,
    ) as XyoCoingeckoCryptoMarketPayload
    const uniswapPayload = query.payloads.find((payload) => payload.schema === XyoUniswapCryptoMarketPayloadSchema) as XyoUniswapCryptoMarketPayload
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    const witnessedResult = this.bindPayloads([result])
    return [witnessedResult, [result]]
  }
}
