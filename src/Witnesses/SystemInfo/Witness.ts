import { XyoWitness, XyoWitnessConfig } from '../../core'
import { XyoSystemInfoPayload } from './Payload'

export class XyoSystemInfoWitness<T extends XyoSystemInfoPayload = XyoSystemInfoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<T, C> {
  constructor(config: C = { schema: 'network.xyo.system.info' } as C) {
    super({ ...config })
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    return await super.observe(fields)
  }
}
