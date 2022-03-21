import merge from 'lodash/merge'
import { get } from 'systeminformation'

import { XyoWitnessConfig } from '../../../Witness'
import { XyoSystemInfoWitness } from '../../../Witnesses'
import { XyoSystemInfoNodePayload } from './Payload'

export interface XyoSystemInfoNodeWitnessConfig<T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload>
  extends XyoWitnessConfig<T> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoNodeWitness<
  T extends XyoSystemInfoNodePayload = XyoSystemInfoNodePayload,
  C extends XyoSystemInfoNodeWitnessConfig<T> = XyoSystemInfoNodeWitnessConfig<T>
> extends XyoSystemInfoWitness<T, C> {
  constructor(
    config: C = { schema: XyoSystemInfoNodeWitness.schema } as C,
    baseSchema = XyoSystemInfoNodeWitness.schema
  ) {
    super(config, baseSchema)
  }
  override async observe(fields?: Partial<T>) {
    const node = await get(
      this.config.nodeValues ?? {
        audio: '*',
        battery: '*',
        bluetooth: '*',
        cpu: '*',
        diskLayout: '*',
        graphics: '*',
        mem: '*',
        networkInterfaces: '*',
        osInfo: '*',
        printer: '*',
        system: '*',
        usb: '*',
        wifiInterfaces: '*',
      }
    )
    return await super.observe(merge({ node }, fields))
  }

  public static schema = 'network.xyo.system.info.node'
}
