import { PartialWitnessConfig, XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends XyoWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig> {
  constructor(config: PartialWitnessConfig<XyoCoingeckoCryptoMarketWitnessConfig>) {
    super({ schema: XyoCoingeckoCryptoMarketWitnessConfigSchema, targetSchema: XyoCoingeckoCryptoMarketSchema, ...config })
  }

  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload> {
    const assets = await pricesFromCoingecko(this.config?.coins ?? [], this.config?.currencies ?? [])

    return {
      assets,
      schema: XyoCoingeckoCryptoMarketSchema,
      timestamp: Date.now(),
    }
  }
}
