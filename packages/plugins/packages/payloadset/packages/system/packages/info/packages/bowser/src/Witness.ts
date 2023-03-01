import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { ModuleParams } from '@xyo-network/module'
import { XyoPayload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoWitnessConfig, XyoBowserSystemInfoWitnessConfigSchema } from './Config'

export class XyoBowserSystemInfoWitness extends AbstractWitness<WitnessParams<XyoBowserSystemInfoWitnessConfig>> implements WitnessModule {
  static override configSchema = XyoBowserSystemInfoWitnessConfigSchema

  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  static override async create(params?: ModuleParams<XyoBowserSystemInfoWitnessConfig>): Promise<XyoBowserSystemInfoWitness> {
    return (await super.create(params)) as XyoBowserSystemInfoWitness
  }

  override observe(payloads?: XyoPayload[]) {
    return super.observe([merge({ bowser: this.bowser }, payloads?.[0], { schema: XyoBowserSystemInfoSchema })])
  }
}
