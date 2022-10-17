import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoWitnessConfig } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'

export class XyoBowserSystemInfoWitness<T extends XyoBowserSystemInfoPayload = XyoBowserSystemInfoPayload> extends XyoWitness<
  T,
  XyoBowserSystemInfoWitnessConfig
> {
  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  override observe(fields?: Partial<T>[]) {
    return super.observe([merge({ bowser: this.bowser }, fields?.[0])])
  }

  static override async create(params?: XyoModuleParams): Promise<XyoBowserSystemInfoWitness> {
    const module = new XyoBowserSystemInfoWitness(params as XyoModuleParams<XyoBowserSystemInfoWitnessConfig>)
    await module.start()
    return module
  }
}
