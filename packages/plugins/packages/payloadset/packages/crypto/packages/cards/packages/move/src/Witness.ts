import { Promisable } from '@xylabs/promise'
import { AbstractWitness } from '@xyo-network/abstract-witness'
import { AnyConfigSchema } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig, WitnessParams } from '@xyo-network/witness-model'

import { CryptoCardsMoveWitnessConfigSchema } from './Schema'

export type CryptoCardsMoveWitnessConfig = WitnessConfig<{
  schema: CryptoCardsMoveWitnessConfigSchema
}>

export type CryptoCardsMoveWitnessParams = WitnessParams<AnyConfigSchema<CryptoCardsMoveWitnessConfig>>

export class CryptoCardsMoveWitness<TParams extends CryptoCardsMoveWitnessParams = CryptoCardsMoveWitnessParams> extends AbstractWitness<TParams> {
  static override configSchemas = [CryptoCardsMoveWitnessConfigSchema]

  protected override observeHandler(payloads?: Payload[]): Promisable<Payload[]> {
    return payloads ?? []
  }
}
