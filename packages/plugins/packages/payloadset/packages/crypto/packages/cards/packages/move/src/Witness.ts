import { AnyConfigSchema } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'
import { AbstractWitness, WitnessParams, XyoWitnessConfig } from '@xyo-network/witness'

import { XyoCryptoCardsMoveWitnessConfigSchema } from './Schema'

export type XyoCryptoCardsMoveWitnessConfig = XyoWitnessConfig<{
  schema: XyoCryptoCardsMoveWitnessConfigSchema
}>

export type XyoCryptoCardsMoveWitnessParams = WitnessParams<AnyConfigSchema<XyoCryptoCardsMoveWitnessConfig>>

export class XyoCryptoCardsMoveWitness<
  TParams extends XyoCryptoCardsMoveWitnessParams = XyoCryptoCardsMoveWitnessParams,
> extends AbstractWitness<TParams> {
  static override configSchema = XyoCryptoCardsMoveWitnessConfigSchema

  static override async create<TParams extends XyoCryptoCardsMoveWitnessParams>(params?: TParams) {
    return (await super.create(params)) as XyoCryptoCardsMoveWitness<TParams>
  }

  override observe(payloads?: XyoPayload[]): Promisable<XyoPayload[]> {
    return super.observe(payloads)
  }
}
