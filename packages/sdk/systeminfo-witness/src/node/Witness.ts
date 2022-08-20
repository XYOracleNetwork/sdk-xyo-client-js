import { XyoWitnessConfig } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoSystemInfoPayload, XyoSystemInfoWitness } from '../shared'
import { defaultSystemInfoConfig } from './Template'

export type XyoSystemInfoNodeWitnessConfig = XyoWitnessConfig<{
  schema: 'network.xyo.system.info.node.config'
  nodeValues?: Record<string, string>
}>

export class XyoSystemInfoNodeWitness<
  T extends XyoSystemInfoPayload = XyoSystemInfoPayload,
  C extends XyoSystemInfoNodeWitnessConfig = XyoSystemInfoNodeWitnessConfig,
> extends XyoSystemInfoWitness<T, C> {
  override async observe(fields?: Partial<T>): Promise<T> {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe({ ...node, ...fields })
  }
}
