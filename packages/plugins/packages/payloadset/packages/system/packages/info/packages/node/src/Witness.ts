import { ModuleParams } from '@xyo-network/module'
import { defaultSystemInfoConfig, XyoNodeSystemInfoSchema } from '@xyo-network/node-system-info-payload-plugin'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule } from '@xyo-network/witness'
import { get } from 'systeminformation'

import { XyoNodeSystemInfoWitnessConfig, XyoNodeSystemInfoWitnessConfigSchema } from './Config'

export class XyoNodeSystemInfoWitness extends AbstractWitness<XyoNodeSystemInfoWitnessConfig> implements WitnessModule {
  static override configSchema = XyoNodeSystemInfoWitnessConfigSchema

  static override async create(params?: ModuleParams<XyoNodeSystemInfoWitnessConfig>): Promise<XyoNodeSystemInfoWitness> {
    return (await super.create(params)) as XyoNodeSystemInfoWitness
  }

  override async observe(payloads?: XyoPayload[]) {
    const node = await get(this.config?.nodeValues ?? defaultSystemInfoConfig())
    return await super.observe([{ ...node, ...payloads?.[0], schema: XyoNodeSystemInfoSchema }])
  }
}
