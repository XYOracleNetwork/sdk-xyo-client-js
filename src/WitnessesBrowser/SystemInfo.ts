import { XyoWitness } from '../XyoWitness'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoPayload } from './XyoSystemInfoPayload'

export class XyoSystemInfoWitness extends XyoWitness<XyoSystemInfoPayload> {
  constructor() {
    super({ schema: 'network.xyo.system.info' })
  }
  override async observe(): Promise<XyoSystemInfoPayload> {
    const browser = observeBowser()
    return await super.observe({ browser })
  }
}
