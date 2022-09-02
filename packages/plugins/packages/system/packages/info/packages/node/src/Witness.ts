import { XyoWitness } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { defaultSystemInfoConfig } from './Template'

export class XyoNodeSystemInfoWitness<
  TPayload extends XyoNodeSystemInfoPayload = XyoNodeSystemInfoPayload,
  TConfig extends XyoNodeSystemInfoWitnessConfig = XyoNodeSystemInfoWitnessConfig,
> extends XyoWitness<TPayload, TConfig> {
  override async observe(fields?: Partial<TPayload>) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe({ ...node, ...fields })
  }
}
