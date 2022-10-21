import { XyoModuleParams } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameSchema, XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsGamePayload,
  {
    schema: XyoCryptoCardsGameWitnessConfigSchema
  }
>

export class XyoCryptoCardsGameWitness extends XyoWitness<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig> {
  static override async create(params?: XyoModuleParams<XyoCryptoCardsGameWitnessConfig>): Promise<XyoCryptoCardsGameWitness> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoCryptoCardsGameWitness(params)
    await module.start()
    return module
  }

  override observe(payloads: XyoCryptoCardsGamePayload[]): Promisable<XyoCryptoCardsGamePayload[]> {
    return super.observe(payloads)
  }

  static override configSchema = XyoCryptoCardsGameWitnessConfigSchema
  static override targetSchema = XyoCryptoCardsGameSchema
}
