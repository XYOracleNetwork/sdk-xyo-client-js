import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsMoveWitnessConfigSchema
}>

export class XyoCryptoCardsMoveWitness extends AbstractWitness<WitnessParams<XyoCryptoCardsMoveWitnessConfig>> {
  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema

  static override async create(params?: WitnessParams<XyoCryptoCardsMoveWitnessConfig>): Promise<XyoCryptoCardsMoveWitness> {
    return (await super.create(params)) as XyoCryptoCardsMoveWitness
  }

  override observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
