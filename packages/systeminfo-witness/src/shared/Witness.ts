import { XyoSimpleWitness, XyoSimpleWitnessConfig } from '@xyo-network/core'

import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<T extends XyoSystemInfoPayload = XyoSystemInfoPayload, C extends XyoSimpleWitnessConfig<T> = XyoSimpleWitnessConfig<T>> extends XyoSimpleWitness<
  T,
  C
> {
  constructor(config: C = { schema: 'network.xyo.system.info' } as C) {
    super({ ...config })
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    return await super.observe(fields)
  }
}
