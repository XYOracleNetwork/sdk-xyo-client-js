import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoNodeSystemInfoWitnessConfig } from './Config'
import { XyoNodeSystemInfoPayload } from './Payload'
import { defaultSystemInfoConfig } from './Template'

export class XyoNodeSystemInfoWitness<TPayload extends XyoNodeSystemInfoPayload = XyoNodeSystemInfoPayload> extends XyoWitness<
  TPayload,
  XyoNodeSystemInfoWitnessConfig
> {
  static override async create(params?: XyoModuleParams<XyoNodeSystemInfoWitnessConfig>): Promise<XyoNodeSystemInfoWitness> {
    params?.logger?.debug(`params: ${JSON.stringify(params, null, 2)}`)
    const module = new XyoNodeSystemInfoWitness(params)
    await module.start()
    return module
  }

  override async observe(fields?: Partial<TPayload>[]) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe([{ ...node, ...fields?.[0] }])
  }
}
