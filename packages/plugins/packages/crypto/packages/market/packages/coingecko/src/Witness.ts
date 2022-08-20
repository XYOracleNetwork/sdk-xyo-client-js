import { XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketPayloadSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends XyoWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig> {
  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload> {
    const assets = await pricesFromCoingecko(this.config.coins ?? [], this.config.currencies ?? [])

    return {
      assets,
      schema: XyoCoingeckoCryptoMarketPayloadSchema,
      timestamp: Date.now(),
    }
  }
}
