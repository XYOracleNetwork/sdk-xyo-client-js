import { difference, intersection, union } from '@xylabs/set'

export class BatchSetIterator<T> implements Iterator<T[]> {
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

  addValues(values: Iterable<T> | Readonly<T>[] | null | undefined): number {
    const incoming = new Set(values)
    const knownTodo = intersection(this.todo, incoming)
    const knownDone = intersection(this.done, incoming)
    const known = union(knownTodo, knownDone)
    const unknown = difference(incoming, known)
    this.todo = union(this.todo, unknown)
    return unknown.size
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
