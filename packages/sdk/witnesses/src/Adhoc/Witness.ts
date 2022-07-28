import { StringKeyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

import { XyoSimpleWitness } from '../Witness'

export class XyoAdhocWitness<T extends XyoPayload = XyoPayload<StringKeyObject>> extends XyoSimpleWitness<T> {
  public payload: T
  constructor(payload: T) {
    super({
      schema: payload.schema,
      template: { schema: '' },
    })
    this.payload = payload
  }

  override async observe(): Promise<T> {
    return await super.observe(this.payload)
  }
}
