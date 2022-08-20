import { XyoAccount } from '@xyo-network/account'
import { WithAdditional } from '@xyo-network/core'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promisable'
import { XyoWitness, XyoWitnessQueryPayload } from '@xyo-network/witness'
import merge from 'lodash/merge'

export class XyoAdhocWitness<T extends XyoPayload = WithAdditional<XyoPayload>> extends XyoWitness<T> {
  public payload: T
  constructor(payload: T, account = new XyoAccount()) {
    super({
      account,
      schema: 'network.xyo.witness.adhoc.config',
      targetSchema: XyoPayloadSchema,
    })
    this.payload = payload
  }

  override observe(fields?: Partial<T>, _query?: XyoWitnessQueryPayload): Promisable<T> {
    return super.observe(merge(this.payload, fields))
  }
}
