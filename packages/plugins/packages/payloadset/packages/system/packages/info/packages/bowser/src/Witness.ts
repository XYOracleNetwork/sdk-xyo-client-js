import { XyoBowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoWitnessConfig, XyoBowserSystemInfoWitnessConfigSchema } from './Config'

export type XyoBowserSystemInfoWitnessParams = WitnessParams<AnyConfigSchema<XyoBowserSystemInfoWitnessConfig>>
export class XyoBowserSystemInfoWitness<TParams extends XyoBowserSystemInfoWitnessParams = XyoBowserSystemInfoWitnessParams>
  extends AbstractWitness<TParams>
  implements WitnessModule
{
  static override configSchema = XyoBowserSystemInfoWitnessConfigSchema

  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  override observe(payloads?: Payload[]) {
    return super.observe([merge({ bowser: this.bowser }, payloads?.[0], { schema: XyoBowserSystemInfoSchema })])
  }
}
