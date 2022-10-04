import { PartialWitnessConfig, XyoWitness } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoNodeSystemInfoWitnessConfig, XyoNodeSystemInfoWitnessConfigSchema } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { XyoNodeSystemInfoSchema } from './Schema'
import { defaultSystemInfoConfig } from './Template'

export class XyoNodeSystemInfoWitness<TPayload extends XyoNodeSystemInfoPayload = XyoNodeSystemInfoPayload> extends XyoWitness<
  TPayload,
  XyoNodeSystemInfoWitnessConfig
> {
  constructor(config?: PartialWitnessConfig<XyoNodeSystemInfoWitnessConfig>) {
    super({ schema: XyoNodeSystemInfoWitnessConfigSchema, targetSchema: XyoNodeSystemInfoSchema, ...config })
  }

  override async observe(fields?: Partial<TPayload>[]) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe({ ...node, ...fields })
  }
}
