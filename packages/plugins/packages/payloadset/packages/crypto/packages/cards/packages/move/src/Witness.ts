import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'

import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = WitnessConfig<{
  schema: XyoCryptoCardsMoveWitnessConfigSchema
}>

export type XyoCryptoCardsMoveWitnessParams = WitnessParams<AnyConfigSchema<XyoCryptoCardsMoveWitnessConfig>>

export class XyoCryptoCardsMoveWitness<
  TParams extends XyoCryptoCardsMoveWitnessParams = XyoCryptoCardsMoveWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema

  override observe(payloads?: Payload[]): Promisable<Payload[]> {
    return super.observe(payloads)
  }
}
