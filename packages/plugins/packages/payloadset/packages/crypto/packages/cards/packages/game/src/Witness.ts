import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { CryptoCardsGameWitnessConfigSchema } from './Schema'

export type CryptoCardsGameWitnessConfig = WitnessConfig<{
  schema: CryptoCardsGameWitnessConfigSchema
}>

export type CryptoCardsGameWitnessParams = WitnessParams<AnyConfigSchema<CryptoCardsGameWitnessConfig>>

export class CryptoCardsGameWitness extends AbstractWitness<CryptoCardsGameWitnessParams> implements WitnessModule {
  static override configSchemas = [CryptoCardsGameWitnessConfigSchema]

  protected override observeHandler(payloads?: Payload[]): Promisable<Payload[]> {
    return payloads ?? []
  }
}
