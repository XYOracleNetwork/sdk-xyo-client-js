import { XyoModuleParams } from '@xyo-network/module'
import { XyoWitness } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoWitnessConfig, XyoBowserSystemInfoWitnessConfigSchema } from './Config'
import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoSchema } from './Schema'

export class XyoBowserSystemInfoWitness<T extends XyoBowserSystemInfoPayload = XyoBowserSystemInfoPayload> extends XyoWitness<
  T,
  XyoBowserSystemInfoWitnessConfig
> {
  static override configSchema = XyoBowserSystemInfoWitnessConfigSchema
  static override targetSchema = XyoBowserSystemInfoSchema

  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  static override async create(params?: XyoModuleParams<XyoBowserSystemInfoWitnessConfig>): Promise<XyoBowserSystemInfoWitness> {
    return (await super.create(params)) as XyoBowserSystemInfoWitness
  }

  override observe(fields?: Partial<T>[]) {
    return super.observe([merge({ bowser: this.bowser }, fields?.[0])])
  }
}
