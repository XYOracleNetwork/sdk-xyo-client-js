import { XyoAbstractDiviner } from '@xyo-network/diviner'
import { XyoModuleQueryResult } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promisable'

import { divinePrices } from './lib'
import { XyoCryptoMarketAssetPayload } from './Payload'
import { XyoCryptoMarketAssetQueryPayload } from './Query'

export class XyoCryptoMarketAssetDiviner extends XyoAbstractDiviner<XyoCryptoMarketAssetQueryPayload> {
  query(query: XyoCryptoMarketAssetQueryPayload): Promisable<XyoModuleQueryResult<XyoCryptoMarketAssetPayload>> {
    const { coinGeckoPayload, uniswapPayload } = query.payloads
    const result: XyoCryptoMarketAssetPayload = divinePrices(coinGeckoPayload, uniswapPayload)
    const witnessedResult = this.bindPayloads([result])
    return [witnessedResult, [result]]
  }
}
