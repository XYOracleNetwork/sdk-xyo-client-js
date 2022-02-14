import { XyoWitness } from '../XyoWitness'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoPayload } from './XyoSystemInfoPayload'

export class XyoSystemInfoWitnessBrowser extends XyoWitness<XyoSystemInfoPayload> {
  constructor() {
    super({
      create: () => {
        return { schema: 'network.xyo.system.info' }
      },
    })
  }
  override async observe(): Promise<XyoSystemInfoPayload> {
    const browser = observeBowser()
    return await super.observe({ browser })
  }
}
