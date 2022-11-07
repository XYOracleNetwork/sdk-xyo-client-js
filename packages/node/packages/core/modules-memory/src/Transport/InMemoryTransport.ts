import { Identifiable, Transport } from '@xyo-network/node-core-model'

// TODO: Use LRU cache
export class InMemoryTransport<T extends Identifiable> implements Transport<T> {
  protected queue: Record<string, T | undefined | null> = {}

  public enqueue(item: T): Promise<string> {
    const id = item.id
    this.queue[id] = item
    return Promise.resolve(id)
  }

  public get(id: string): Promise<T | undefined | null> {
    const value = this.queue[id]
    if (value) {
      this.queue[id] = null
    }
    return Promise.resolve(value)
  }
}
