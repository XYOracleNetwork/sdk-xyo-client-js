import { XyoPayload } from './models'
import { XyoPayloadBuilder } from './Payload'

export interface XyoWitnessConfig<T extends XyoPayload> {
  schema: string
  observer?: () => Promise<T> | T
}

export class XyoWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> {
  public config: C
  constructor(config: C) {
    this.config = config
  }

  public async observe(fields?: Partial<T>) {
    return new XyoPayloadBuilder<T>({ schema: this.config.schema })
      .fields(await this.config.observer?.())
      .fields(fields)
      .build()
  }
}
