import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsGameWitnessConfigSchema
}>

export class XyoCryptoCardsGameWitness extends AbstractWitness<XyoCryptoCardsGameWitnessConfig> {
  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoCryptoCardsGameWitnessConfig>): Promise<XyoCryptoCardsGameWitness> {
    return (await super.create(params)) as XyoCryptoCardsGameWitness
  }

  override observe(payloads: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
