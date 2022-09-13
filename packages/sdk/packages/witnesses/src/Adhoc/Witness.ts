import { WithAdditional } from '@xyo-network/core'
import { XyoPayload, XyoPayloadSchema } from '@xyo-network/payload'
import { Promisable } from '@xyo-network/promise'
import { XyoWitness } from '@xyo-network/witness'
import merge from 'lodash/merge'

export type XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'
export const XyoAdhocWitnessConfigSchema = 'network.xyo.witness.adhoc.config'

export class XyoAdhocWitness<T extends XyoPayload = WithAdditional<XyoPayload>> extends XyoWitness<T> {
  public payload: T
  constructor(payload: T) {
    super({
      schema: XyoAdhocWitnessConfigSchema,
      targetSchema: XyoPayloadSchema,
    })
    this.payload = payload
  }

  override observe(fields?: Partial<T>): Promisable<T> {
    return super.observe(merge(this.payload, fields))
  }
}
