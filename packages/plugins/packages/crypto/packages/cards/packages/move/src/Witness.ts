import { XyoModuleParams } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveSchema, XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsMovePayload,
  {
    schema: XyoCryptoCardsMoveWitnessConfigSchema
  }
>

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig> {
  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema
  static override targetSchema = XyoCryptoCardsMoveSchema

  static override async create(params?: XyoModuleParams<XyoCryptoCardsMoveWitnessConfig>): Promise<XyoCryptoCardsMoveWitness> {
    return (await super.create(params)) as XyoCryptoCardsMoveWitness
  }

  override observe(payloads: XyoCryptoCardsMovePayload[]): Promisable<XyoCryptoCardsMovePayload[]> {
    return super.observe(payloads)
  }
}
