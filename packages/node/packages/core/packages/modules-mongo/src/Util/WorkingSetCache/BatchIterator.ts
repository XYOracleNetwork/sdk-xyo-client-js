import { union } from './SetOperations'

export class BatchIterator<T> implements Iterator<T[]> {
  private batchSize: number
  private done: Set<T>
  private todo: Set<T>

  constructor(values: T[], batchSize: number) {
    this.todo = new Set(values)
    this.done = new Set<T>()
    this.batchSize = batchSize
  }

  [Symbol.iterator](): IterableIterator<T[]> {
    return this
  }

  addValues(values: Iterable<T> | Readonly<T>[] | null | undefined): void {
    const incoming = new Set(values)
    this.todo = union(this.todo, incoming)
  }

  next(): IteratorResult<T[]> {
    if (this.todo.size === 0) {
      if (this.done.size === 0) {
        return {
          done: true,
          value: [],
        }
      }
      this.todo = new Set(this.done)
      this.done = new Set<T>()
    }

    const todo = Array.from(this.todo)
    const batch = todo.slice(0, this.batchSize)
    const remaining = todo.slice(this.batchSize)

    this.todo = new Set(remaining)
    this.done = union(this.done, new Set(batch))

    return {
      done: false,
      value: batch,
    }
  }
}
