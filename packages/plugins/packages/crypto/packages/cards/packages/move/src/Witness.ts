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
  static override async create(params?: XyoModuleParams<XyoCryptoCardsMoveWitnessConfig>): Promise<XyoCryptoCardsMoveWitness> {
    params?.logger?.debug(`params.config: ${JSON.stringify(params.config, null, 2)}`)
    const module: XyoCryptoCardsMoveWitness = new XyoCryptoCardsMoveWitness(params)
    await module.start()
    return module
  }

  override observe(payloads: XyoCryptoCardsMovePayload[]): Promisable<XyoCryptoCardsMovePayload[]> {
    return super.observe(payloads)
  }

  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema
  static override targetSchema = XyoCryptoCardsMoveSchema
}
