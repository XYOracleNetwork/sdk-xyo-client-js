import { XyoPayload } from './models'
import { XyoPayloadBuilder } from './Payload'

export interface XyoWitnessConfig<T extends XyoPayload> {
  schema: string
  observer?: () => T
}

export class XyoWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> {
  public config: C
  constructor(config: C) {
    this.config = config
  }

  public observe(fields?: Partial<T>): Promise<T> | T {
    const result = new XyoPayloadBuilder<T>({ schema: this.config.schema })
      .fields(this.config.observer?.())
      .fields(fields)
      .build()
    return result
  }
}
