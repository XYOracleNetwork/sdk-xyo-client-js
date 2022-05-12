import { XyoPayload, XyoWitness } from '@xyo-network/core'

export class XyoAdhocWitness extends XyoWitness<XyoPayload> {
  public payload: XyoPayload
  constructor(payload: XyoPayload) {
    super({
      schema: payload.schema,
      template: { schema: '' },
    })
    this.payload = payload
  }

  override async observe(): Promise<XyoPayload> {
    return await super.observe(this.payload)
  }
}
