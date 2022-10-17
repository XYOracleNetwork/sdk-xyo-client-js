import { XyoModuleConfig, XyoModuleParams } from '@xyo-network/module'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMovePayload } from './Payload'
import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<
  XyoCryptoCardsMovePayload,
  {
    schema: XyoCryptoCardsMoveWitnessConfigSchema
  }
>

export class XyoCryptoCardsMoveWitness extends XyoWitness<XyoCryptoCardsMovePayload, XyoCryptoCardsMoveWitnessConfig> {
  static override async create(params?: XyoModuleParams<XyoModuleConfig>): Promise<XyoCryptoCardsMoveWitness> {
    const module: XyoCryptoCardsMoveWitness = new XyoCryptoCardsMoveWitness(params as XyoModuleParams<XyoCryptoCardsMoveWitnessConfig>)
    await module.start()
    return module
  }

  override observe(payloads: XyoCryptoCardsMovePayload[]): Promisable<XyoCryptoCardsMovePayload[]> {
    return super.observe(payloads)
  }
}
