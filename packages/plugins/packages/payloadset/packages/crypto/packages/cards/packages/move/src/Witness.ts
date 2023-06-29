import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessParams } from '@xyo-network/witness'

import { CryptoCardsMoveWitnessConfigSchema } from './Schema'

export type CryptoCardsMoveWitnessConfig = WitnessConfig<{
  schema: CryptoCardsMoveWitnessConfigSchema
}>

export type CryptoCardsMoveWitnessParams = WitnessParams<AnyConfigSchema<CryptoCardsMoveWitnessConfig>>

export class CryptoCardsMoveWitness<TParams extends CryptoCardsMoveWitnessParams = CryptoCardsMoveWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [CryptoCardsMoveWitnessConfigSchema]

  override observe(payloads?: Payload[]): Promisable<Payload[]> {
    return super.observe(payloads)
  }
}
