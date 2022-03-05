import { XyoWitness } from '../../XyoWitness'
import { XyoSchemaPayload } from './Payload'

export class XyoSchemaWitness extends XyoWitness<XyoSchemaPayload> {
  public name: string
  constructor(name: string) {
    super({
      schema: XyoSchemaWitness.schema,
    })
    this.name = name
  }

  override async observe(fields: { definition: Record<string, unknown> }): Promise<XyoSchemaPayload> {
    return await super.observe(fields)
  }

  public static schema = 'network.xyo.schema'
}
