import { Parser } from 'bowser'
import { get } from 'systeminformation'

import { XyoPayload } from '../models'
import { XyoWitness, XyoWitnessConfig } from '../XyoWitness'
import { observeBowser } from './observeBowser'

export interface XyoSystemInfoPayload extends XyoPayload {
  bowser?: Parser.ParsedResult
  systeminformation?: Record<string, unknown>
}

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
    return super.observe({ browser, node })
  }
}
