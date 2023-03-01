import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessModule, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsGameWitnessConfigSchema
}>

export class XyoCryptoCardsGameWitness extends AbstractWitness<WitnessParams<XyoCryptoCardsGameWitnessConfig>> implements WitnessModule {
  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema

  static override async create(params?: WitnessParams<XyoCryptoCardsGameWitnessConfig>): Promise<XyoCryptoCardsGameWitness> {
    return (await super.create(params)) as XyoCryptoCardsGameWitness
  }

  override observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
