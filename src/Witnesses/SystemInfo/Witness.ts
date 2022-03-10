import { assertEx } from '@xylabs/sdk-js'

import { XyoWitness, XyoWitnessConfig } from '../../Witness'
import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<
  T extends XyoSystemInfoPayload = XyoSystemInfoPayload,
  C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>
> extends XyoWitness<T, C> {
  constructor(config: C = { schema: XyoSystemInfoWitness.schema } as C, baseSchema = XyoSystemInfoWitness.schema) {
    assertEx(config.schema.startsWith(baseSchema), 'Invalid schema')
    super(config)
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    return await super.observe(fields)
  }

  public static schema = 'network.xyo.system.info'
}
