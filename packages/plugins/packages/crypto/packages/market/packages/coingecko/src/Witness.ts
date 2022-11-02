import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketPayload } from './Payload'
import { XyoCoingeckoCryptoMarketSchema, XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends XyoWitness<XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketWitnessConfig> {
  static override configSchema = XyoCoingeckoCryptoMarketWitnessConfigSchema
  static override targetSchema = XyoCoingeckoCryptoMarketSchema

  static override async create(params?: XyoModuleParams<XyoCoingeckoCryptoMarketWitnessConfig>): Promise<XyoCoingeckoCryptoMarketWitness> {
    return (await super.create(params)) as XyoCoingeckoCryptoMarketWitness
  }

  override async observe(): Promise<XyoCoingeckoCryptoMarketPayload[]> {
    const assets: XyoCoingeckoCryptoMarketPayload['assets'] = await pricesFromCoingecko(this.config?.coins ?? [], this.config?.currencies ?? [])
    const payload: Partial<XyoCoingeckoCryptoMarketPayload> = {
      assets,
      timestamp: Date.now(),
    }

    return super.observe([payload])
  }
}
