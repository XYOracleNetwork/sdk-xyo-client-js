import { Transport } from '../Transport'

export abstract class Queue<T> {
  public onDequeued?: (id: string) => void
  public onQueued?: (id: string) => void

  constructor(protected readonly transport: Transport<T>) {}

  public readonly enqueue = async (item: T) => {
    const id = await this.transport.enqueue(item)
    this.onQueued?.(id)
    return id
  }

  /**
   * Tries to get a query
   * @param id The id of the query to get
   * @returns The query if it exists, null if it's
   * already been dequeue, undefined if it doesn't exist
   */
  public readonly get = (id: string) => {
    return this.transport.get(id)
  }

  /**
   * Tries to dequeue an item
   * @param id The id of the query to dequeue
   * @returns The query if it exists, null if it's
   * already been dequeue, undefined if it doesn't exist
   */
  public readonly tryDequeue = async (id: string) => {
    const result = await this.transport.get(id)
    if (result) {
      this.onDequeued?.(id)
    }
    return result
  }
}
