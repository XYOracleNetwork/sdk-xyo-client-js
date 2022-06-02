import { XyoPayload, XyoPayloadBuilder } from '../Payload'
import { XyoWitness } from './Witness'

export interface XyoWitnessConfig<T extends XyoPayload = XyoPayload> {
  schema: string
  template?: XyoPayload
  observer?: () => Promise<T> | T
}

export class XyoLegacyWitness<T extends XyoPayload = XyoPayload, C extends XyoWitnessConfig<T> = XyoWitnessConfig<T>> extends XyoWitness<T> {
  public config?: C
  public previousHash?: string

  constructor(config?: C) {
    super()
    this.config = config
  }

  public async observe(fields?: Partial<T>) {
    return new XyoPayloadBuilder<T>({ schema: this.config?.schema ?? 'network.xyo.payload' })
      .previousHash(this.previousHash)
      .fields(await this.config?.observer?.())
      .fields(fields)
      .build()
  }
}
