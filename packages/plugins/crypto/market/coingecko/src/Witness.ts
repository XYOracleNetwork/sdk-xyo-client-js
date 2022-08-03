import { XyoQueryWitness } from '@xyo-network/witness'

import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketQueryPayload } from './Query'

export class XyoCoingeckoCryptoMarketWitness extends XyoQueryWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketQueryPayload> {
  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload> {
    const assets = await pricesFromCoingecko(this.config?.query.coins ?? [], this.config?.query.currencies ?? [])

    return await super.observe({
      assets,
      timestamp: Date.now(),
    })
  }
}
