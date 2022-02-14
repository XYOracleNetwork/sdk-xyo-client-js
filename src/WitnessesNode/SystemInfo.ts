import { get } from 'systeminformation'

import { XyoWitness, XyoWitnessConfig } from '../XyoWitness'
import { XyoSystemInfoPayload } from './XyoSystemInfoPayload'

export interface XyoSystemInfoWitnessConfig extends XyoWitnessConfig<XyoSystemInfoPayload> {
  nodeValues?: Record<string, string>
}

export class XyoSystemInfoWitness extends XyoWitness<XyoSystemInfoPayload, XyoSystemInfoWitnessConfig> {
  constructor() {
    super({
      create: () => {
        return { schema: 'network.xyo.system.info' }
      },
    })
  }
  override async observe(): Promise<XyoSystemInfoPayload> {
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
    return await super.observe({ node })
  }
}
