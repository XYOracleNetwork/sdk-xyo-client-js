import { XyoModuleConfig, XyoModuleParams } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsGamePayload } from './Payload'
import { XyoCryptoCardsGameWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsGameWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsGamePayload,
  {
    schema: XyoCryptoCardsGameWitnessConfigSchema
  }
>

export class XyoCryptoCardsGameWitness extends XyoWitness<XyoCryptoCardsGamePayload, XyoCryptoCardsGameWitnessConfig> {
  static override async create(params?: XyoModuleParams<XyoModuleConfig>): Promise<XyoCryptoCardsGameWitness> {
    const module = new XyoCryptoCardsGameWitness(params as XyoModuleParams<XyoCryptoCardsGameWitnessConfig>)
    await module.start()
    return module
  }

  override observe(payloads: XyoCryptoCardsGamePayload[]): Promisable<XyoCryptoCardsGamePayload[]> {
    return super.observe(payloads)
  }
}
