import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { AbstractWitness } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends AbstractWitness<XyoCoingeckoCryptoMarketWitnessConfig> {
  static override configSchema = XyoCoingeckoCryptoMarketWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoCoingeckoCryptoMarketWitnessConfig>): Promise<XyoCoingeckoCryptoMarketWitness> {
    return (await super.create(params)) as XyoCoingeckoCryptoMarketWitness
  }

  override async observe(): Promise<XyoPayload[]> {
    const assets: XyoCoingeckoCryptoMarketPayload['assets'] = await pricesFromCoingecko(this.config?.coins ?? [], this.config?.currencies ?? [])
    const payload: XyoCoingeckoCryptoMarketPayload = {
      assets,
      schema: XyoCoingeckoCryptoMarketSchema,
      timestamp: Date.now(),
    }

    return super.observe([payload])
  }
}
