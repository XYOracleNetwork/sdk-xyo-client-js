import { XyoPayload } from '../../models'
import { XyoWitness } from '../../XyoWitness'

export class XyoAdhocWitness extends XyoWitness<XyoPayload> {
  public payload: XyoPayload
  constructor(payload: XyoPayload) {
    super({
      schema: payload.schema,
    })
    this.payload = payload
  }

  override async observe(): Promise<XyoPayload> {
    return await super.observe(this.payload)
  }
}
