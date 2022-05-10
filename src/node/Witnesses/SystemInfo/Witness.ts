import merge from 'lodash/merge'
import { get } from 'systeminformation'

import { XyoWitnessConfig } from '../../../core'
import { XyoSystemInfoWitness } from '../../../Witnesses'
import { XyoSystemInfoNodePayload } from './Payload'
import { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate } from './Template'

export interface XyoSystemInfoNodeWitnessConfig<T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload> extends XyoWitnessConfig<T> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoNodeWitness<
  T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload,
  C extends XyoSystemInfoNodeWitnessConfig<T> = XyoSystemInfoNodeWitnessConfig<T>
> extends XyoSystemInfoWitness<T, C> {
  constructor(config: C = { schema: 'network.xyo.system.info.node' } as C) {
    super({
      ...{ template: systemInfoNodeWitnessTemplate() },
      ...config,
    })
  }
  override async observe(fields?: Partial<T>) {
    const node = await get(this.config.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe(merge({ node }, fields))
  }
}
