import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends XyoWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig> {
  static override async create(params?: XyoModuleParams): Promise<XyoCoingeckoCryptoMarketWitness> {
    const module = new XyoCoingeckoCryptoMarketWitness(params as XyoModuleParams<XyoCoingeckoCryptoMarketWitnessConfig>)
    await module.start()
    return module
  }

  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload[]> {
    const assets = await pricesFromCoingecko(this.config?.coins ?? [], this.config?.currencies ?? [])

    return [
      {
        assets,
        schema: XyoCoingeckoCryptoMarketSchema,
        timestamp: Date.now(),
      },
    ]
  }
}
