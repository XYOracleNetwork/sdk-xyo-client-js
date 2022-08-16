import { XyoWitnessConfig, XyoWitnessQueryPayload } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoSystemInfoWitness } from '../shared'
import { XyoSystemInfoNodePayload } from './Payload'
import { defaultSystemInfoConfig } from './Template'

export interface XyoSystemInfoNodeWitnessConfig<Q extends XyoWitnessQueryPayload = XyoWitnessQueryPayload> extends XyoWitnessConfig<Q> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoNodeWitness<
  T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload,
  Q extends XyoWitnessQueryPayload<T> = XyoWitnessQueryPayload<T>,
  C extends XyoSystemInfoNodeWitnessConfig<Q> = XyoSystemInfoNodeWitnessConfig<Q>,
> extends XyoSystemInfoWitness<T, Q, C> {
  override async observe(_fields?: Partial<XyoSystemInfoNodePayload>, _query?: Q | undefined): Promise<T> {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe(node)
  }
}
