import { XyoWitness } from '@xyo-network/witness'

import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketQueryPayload } from './Query'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends XyoWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketQueryPayload> {
  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload> {
    const assets = await pricesFromCoingecko(this.config.query?.coins ?? [], this.config.query?.currencies ?? [])

    return {
      assets,
      schema: XyoCoingeckoCryptoMarketPayloadSchema,
      timestamp: Date.now(),
    }
  }
}
