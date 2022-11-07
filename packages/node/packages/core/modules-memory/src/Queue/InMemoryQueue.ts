import { Identifiable, Queue, Transport } from '@xyo-network/node-core-model'

import { InMemoryTransport } from '../Transport'

export class InMemoryQueue<T extends Identifiable> extends Queue<T> {
  constructor(protected transport: Transport<T> = new InMemoryTransport<T>()) {
    super(transport)
  }
}
