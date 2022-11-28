import { XyoModuleParams } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema, XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsGamePayload,
  {
    schema: XyoCryptoCardsGameWitnessConfigSchema
  }
>

export class XyoCryptoCardsGameWitness extends AbstractWitness<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig> {
  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema
  static override targetSchema = XyoCryptoCardsGameSchema

  static override async create(params?: XyoModuleParams<XyoCryptoCardsGameWitnessConfig>): Promise<XyoCryptoCardsGameWitness> {
    return (await super.create(params)) as XyoCryptoCardsGameWitness
  }

  override observe(payloads: XyoCryptoCardsGamePayload[]): Promisable<XyoCryptoCardsGamePayload[]> {
    return super.observe(payloads)
  }
}
