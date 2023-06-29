import { BowserSystemInfoSchema } from '@xyo-network/bowser-system-info-payload-plugin'
import { AnyConfigSchema } from '@xyo-network/module'
import { Payload } from '@xyo-network/payload-model'
import { AbstractWitness, WitnessModule, WitnessParams } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { BowserSystemInfoWitnessConfig, BowserSystemInfoWitnessConfigSchema } from './Config'

export type BowserSystemInfoWitnessParams = WitnessParams<AnyConfigSchema<BowserSystemInfoWitnessConfig>>
export class BowserSystemInfoWitness<TParams extends BowserSystemInfoWitnessParams = BowserSystemInfoWitnessParams>
  extends AbstractWitness<TParams>
  implements WitnessModule
{
  static override configSchemas = [BowserSystemInfoWitnessConfigSchema]

  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  override observe(payloads?: Payload[]) {
    return super.observe([merge({ bowser: this.bowser }, payloads?.[0], { schema: BowserSystemInfoSchema })])
  }
}
