import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessConfig, WitnessModule, WitnessParams } from '@xyo-network/witness'

import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = WitnessConfig<{
  schema: XyoCryptoCardsGameWitnessConfigSchema
}>

export type XyoCryptoCardsGameWitnessParams = WitnessParams<AnyConfigSchema<XyoCryptoCardsGameWitnessConfig>>

export class XyoCryptoCardsGameWitness extends AbstractWitness<XyoCryptoCardsGameWitnessParams> implements WitnessModule {
  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema

  override observe(payloads?: Payload[]): Promisable<Payload[]> {
    return super.observe(payloads)
  }
}
