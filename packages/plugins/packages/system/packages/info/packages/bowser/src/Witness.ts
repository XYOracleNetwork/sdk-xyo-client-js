import { PartialWitnessConfig, XyoWitness } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoWitnessConfig, XyoBowserSystemInfoWitnessConfigSchema } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'

export class XyoBowserSystemInfoWitness<T extends XyoBowserSystemInfoPayload = XyoBowserSystemInfoPayload> extends XyoWitness<T> {
  constructor(config?: PartialWitnessConfig<XyoBowserSystemInfoWitnessConfig>) {
    super({ schema: XyoBowserSystemInfoWitnessConfigSchema, targetSchema: XyoBowserSystemInfoSchema, ...config })
  }

  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  override observe(fields?: Partial<T>[]) {
    return super.observe(merge({ bowser: this.bowser }, fields))
  }
}
