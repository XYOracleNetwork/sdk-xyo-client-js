import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessModule, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsGameWitnessConfigSchema
}>

export type XyoCryptoCardsGameWitnessParams = WitnessParams<AnyConfigSchema<XyoCryptoCardsGameWitnessConfig>>

export class XyoCryptoCardsGameWitness extends AbstractWitness<XyoCryptoCardsGameWitnessParams> implements WitnessModule {
  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema

  override observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
