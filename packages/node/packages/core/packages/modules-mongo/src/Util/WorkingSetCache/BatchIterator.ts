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
      this.todo = new Set(this.done)
      this.done = new Set<T>()
    }

    // const todo = Array.from(this.todo)
    // const _batch = todo.slice(0, this.batchSize)
    // const _remaining = todo.slice(this.batchSize)

    const batch = Array.from(this.todo).slice(0, this.batchSize)
    batch.forEach((value) => {
      this.todo.delete(value)
      this.done.add(value)
    })

    return {
      done: false,
      value: batch,
    }
  }
}
