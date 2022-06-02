import { delay } from '@xylabs/sdk-js'

import { XyoPayload, XyoPayloadBuilder } from '../Payload'
import { XyoQueryPayload } from '../Query'
import { XyoWitness } from './Witness'

export class XyoQueryWitness<Q extends XyoQueryPayload, T extends XyoPayload> extends XyoWitness {
  public query: Q

  constructor(query: Q) {
    super()
    this.query = query
  }

  public async observe(fields?: Partial<T>): Promise<T> {
    await delay(0)
    return new XyoPayloadBuilder<T>({ schema: this.query.targetSchema ?? 'network.xyo.payload' }).fields(fields).build()
  }
}
