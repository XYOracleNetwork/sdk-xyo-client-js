import { XyoPayload, XyoPayloadBuilder, XyoQueryPayload } from '@xyo-network/payload'

import { XyoWitness } from './Witness'

export class XyoQueryWitness<Q extends XyoQueryPayload, T extends XyoPayload> extends XyoWitness {
  public query: Q

  constructor(query: Q) {
    super()
    this.query = query
  }

  override get targetSchema() {
    return this.query.targetSchema ?? 'network.xyo.payload'
  }

  public observe(fields?: Partial<T>): Promise<T> {
    return Promise.resolve(new XyoPayloadBuilder<T>({ schema: this.targetSchema }).fields(fields).build())
  }
}
