import { XyoCoingeckoCryptoMarketPayload, XyoCoingeckoCryptoMarketSchema } from '@xyo-network/coingecko-crypto-market-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessParams } from '@xyo-network/witness'

import { XyoCoingeckoCryptoMarketWitnessConfig } from './Config'
import { pricesFromCoingecko } from './lib'
import { XyoCoingeckoCryptoMarketWitnessConfigSchema } from './Schema'

export type XyoCoingeckoCryptoMarketWitnessParams = WitnessParams<AnyConfigSchema<XyoCoingeckoCryptoMarketWitnessConfig>>

export class XyoCoingeckoCryptoMarketWitness<
  TParams extends XyoCoingeckoCryptoMarketWitnessParams = XyoCoingeckoCryptoMarketWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoCoingeckoCryptoMarketWitnessConfigSchema

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
