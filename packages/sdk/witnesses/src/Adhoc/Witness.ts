import { WithAdditional } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'
import { XyoSimpleWitness } from '@xyo-network/witness'

export class XyoAdhocWitness<T extends XyoPayload = WithAdditional<XyoPayload>> extends XyoSimpleWitness<T> {
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
