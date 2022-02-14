import { get } from 'systeminformation'

import { XyoWitness, XyoWitnessConfig } from '../XyoWitness'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoPayload } from './XyoSystemInfoPayload'

export interface XyoSystemInfoWitnessNodeConfig extends XyoWitnessConfig<XyoSystemInfoPayload> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoWitnessNode extends XyoWitness<XyoSystemInfoPayload, XyoSystemInfoWitnessNodeConfig> {
  constructor() {
    super({
      create: () => {
        return { schema: 'network.xyo.system.info' }
      },
    })
  }
  override async observe(): Promise<XyoSystemInfoPayload> {
    const browser = observeBowser()
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
    return await super.observe({ browser, node })
  }
}
