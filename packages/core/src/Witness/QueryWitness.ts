import { delay } from '@xylabs/sdk-js'

import { XyoPayload, XyoPayloadBuilder } from '../Payload'
import { XyoQueryPayload } from '../Query'

export class XyoQueryWitness<Q extends XyoQueryPayload, T extends XyoPayload> {
  public query: Q

  constructor(query: Q) {
    this.query = query
  }

  public async observe(fields?: Partial<T>): Promise<T> {
    await delay(0)
    return new XyoPayloadBuilder<T>({ schema: this.query.targetSchema ?? 'network.xyo.payload' }).fields(fields).build()
  }
}
