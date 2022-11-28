import { XyoModuleParams } from '@xyo-network/module'
import { AbstractWitness } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoNodeSystemInfoWitnessConfig, XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { defaultSystemInfoConfig } from './Template'

export class XyoNodeSystemInfoWitness<TPayload extends XyoNodeSystemInfoPayload = XyoNodeSystemInfoPayload> extends AbstractWitness<
  TPayload,
  XyoNodeSystemInfoWitnessConfig
> {
  static override configSchema = XyoNodeSystemInfoWitnessConfigSchema
  static override targetSchema = XyoNodeSystemInfoSchema

  static override async create(params?: XyoModuleParams<XyoNodeSystemInfoWitnessConfig>): Promise<XyoNodeSystemInfoWitness> {
    return (await super.create(params)) as XyoNodeSystemInfoWitness
  }

  override async observe(fields?: Partial<TPayload>[]) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe([{ ...node, ...fields?.[0] }])
  }
}
