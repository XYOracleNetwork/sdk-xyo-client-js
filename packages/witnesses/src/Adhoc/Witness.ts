import { StringKeyObject, XyoPayload, XyoSimpleWitness } from '@xyo-network/core'

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
