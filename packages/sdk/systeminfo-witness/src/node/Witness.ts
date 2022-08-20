import { XyoWitnessConfig } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoSystemInfoPayload, XyoSystemInfoPayloadSchema, XyoSystemInfoWitness } from '../shared'
import { defaultSystemInfoConfig } from './Template'

export type XyoSystemInfoNodeWitnessConfigSchema = 'network.xyo.system.info.node.config'
export const XyoSystemInfoNodeWitnessConfigSchema: XyoSystemInfoNodeWitnessConfigSchema = 'network.xyo.system.info.node.config'

export type XyoSystemInfoNodeWitnessConfig = XyoWitnessConfig<
  XyoSystemInfoPayloadSchema,
  {
    schema: XyoSystemInfoNodeWitnessConfigSchema
    nodeValues?: Record<string, string>
    targetSchema: XyoSystemInfoPayloadSchema
  }
>

export class XyoSystemInfoNodeWitness<
  TSchema extends string = XyoSystemInfoPayloadSchema,
  TPayload extends XyoSystemInfoPayload<TSchema> = XyoSystemInfoPayload<TSchema>,
  TConfig extends XyoSystemInfoNodeWitnessConfig = XyoSystemInfoNodeWitnessConfig,
> extends XyoSystemInfoWitness<TSchema, TPayload, TConfig> {
  override async observe(fields?: Partial<TPayload>) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe({ ...node, ...fields })
  }
}
