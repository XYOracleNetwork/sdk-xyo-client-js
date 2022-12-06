import { XyoModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsMoveWitnessConfigSchema
}>

export class XyoCryptoCardsMoveWitness extends AbstractWitness<XyoCryptoCardsMoveWitnessConfig> {
  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema

  static override async create(params?: XyoModuleParams<XyoCryptoCardsMoveWitnessConfig>): Promise<XyoCryptoCardsMoveWitness> {
    return (await super.create(params)) as XyoCryptoCardsMoveWitness
  }

  override observe(payloads: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
