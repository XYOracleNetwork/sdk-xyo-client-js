import { XyoWitness, XyoWitnessConfig } from '../../core'
import { XyoSystemInfoPayload } from './Payload'
import { systemInfoTemplate } from './Template'

export class XyoSystemInfoWitness<T extends XyoSystemInfoPayload = XyoSystemInfoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<T, C> {
  // TODO: Handle different template types for various system witnesses
  constructor(config: C = { schema: 'network.xyo.system.info', template: systemInfoTemplate } as C) {
    super({ ...config })
  }

  override async observe(fields?: Partial<T>): Promise<T> {
    return await super.observe(fields)
  }
}
