import merge from 'lodash/merge'

import { XyoSystemInfoWitness } from '../../../Witnesses'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoBrowserPayload } from './Payload'

export class XyoSystemInfoBrowserWitness<T extends XyoSystemInfoBrowserPayload = XyoSystemInfoBrowserPayload> extends XyoSystemInfoWitness<T> {
  constructor(config = { schema: XyoSystemInfoBrowserWitness.schema }, baseSchema = XyoSystemInfoBrowserWitness.schema) {
    super(config, baseSchema)
  }
  override async observe(fields?: Partial<T>) {
    const bowser = observeBowser()
    return await super.observe(merge({ bowser }, fields))
  }

  public static schema = 'network.xyo.system.info.browser'
}
