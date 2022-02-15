import { XyoWitness } from '../XyoWitness'
import { XyoSystemInfoPayload } from './XyoSystemInfoPayload'

//this is the type neutral (browser vs node) version of the class
export class XyoSystemInfoWitness extends XyoWitness<XyoSystemInfoPayload> {
  constructor() {
    super({ schema: 'network.xyo.system.info' })
  }
  override async observe(): Promise<XyoSystemInfoPayload> {
    return await super.observe({})
  }
}
