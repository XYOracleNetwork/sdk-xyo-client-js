import merge from 'lodash/merge'

import { XyoSystemInfoWitness } from '../../../Witnesses'
import { observeBowser } from './observeBowser'
import { XyoSystemInfoBrowserPayload } from './Payload'
import { SystemInfoBrowserWitnessTemplate } from './Template'

const template = SystemInfoBrowserWitnessTemplate()

export class XyoSystemInfoBrowserWitness<T extends XyoSystemInfoBrowserPayload = XyoSystemInfoBrowserPayload> extends XyoSystemInfoWitness<T> {
  constructor(config = { schema: template.schema, template }) {
    super(config)
  }
  override async observe(fields?: Partial<T>) {
    const bowser = observeBowser()
    return await super.observe(merge({ bowser }, fields))
  }
}
