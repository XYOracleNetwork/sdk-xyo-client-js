import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export class XyoCoingeckoCryptoMarketWitness extends AbstractWitness<WitnessParams<XyoCoingeckoCryptoMarketWitnessConfig>> {
  static override configSchema = XyoCoingeckoCryptoMarketWitnessConfigSchema

  static override async create(params?: WitnessParams<XyoCoingeckoCryptoMarketWitnessConfig>): Promise<XyoCoingeckoCryptoMarketWitness> {
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
