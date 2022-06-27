import { XyoSimpleWitnessConfig } from '@xyo-network/witnesses'
import merge from 'lodash/merge'
import { get } from 'systeminformation'

import { XyoSystemInfoWitness } from '../shared'
import { XyoSystemInfoNodePayload } from './Payload'
import { defaultSystemInfoConfig, systemInfoNodeWitnessTemplate } from './Template'

const template = systemInfoNodeWitnessTemplate()

export interface XyoSystemInfoNodeWitnessConfig<T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload> extends XyoSimpleWitnessConfig<T> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoNodeWitness<
  T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload,
  C extends XyoSystemInfoNodeWitnessConfig<T> = XyoSystemInfoNodeWitnessConfig<T>
> extends XyoSystemInfoWitness<T, C> {
  constructor(config: C = { schema: template.schema } as C) {
    super({
      ...template,
      ...config,
    })
  }
  override async observe(fields?: Partial<T>) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe(merge({ node }, fields))
  }
}
