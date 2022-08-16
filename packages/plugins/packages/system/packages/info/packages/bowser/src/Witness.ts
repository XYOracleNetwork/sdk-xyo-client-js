import { XyoWitness } from '@xyo-network/witness'
import Bowser from 'bowser'
import merge from 'lodash/merge'

import { XyoBowserSystemInfoPayload } from './Payload'
import { XyoBowserSystemInfoPayloadSchema } from './Schema'

export class XyoBowserSystemInfoWitness<T extends XyoBowserSystemInfoPayload = XyoBowserSystemInfoPayload> extends XyoWitness<T> {
  protected get bowser() {
    // we do this to fix importing in node-esm
    // eslint-disable-next-line import/no-named-as-default-member
    return Bowser.parse(window.navigator.userAgent)
  }

  override observe(fields?: Partial<T>): T {
    return merge({ bowser: this.bowser }, fields, { schema: XyoBowserSystemInfoPayloadSchema }) as T
  }
}
