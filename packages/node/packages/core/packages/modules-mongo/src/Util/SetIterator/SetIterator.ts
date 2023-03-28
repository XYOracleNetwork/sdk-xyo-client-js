import { difference, intersection, union } from './SetOperations'

export class SetIterator<T> implements Iterator<T> {
  private done: Set<T>
  private todo: Set<T>

  constructor(values: T[]) {
    this.todo = new Set(values)
    this.done = new Set<T>()
  }

  [Symbol.iterator](): IterableIterator<T> {
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

  next(): IteratorResult<T> {
    if (this.todo.size === 0) {
      if (this.done.size === 0) {
        return {
          done: true,
          value: undefined,
        }
      }
      this.todo = new Set(this.done)
      this.done = new Set<T>()
    }

    const value = Array.from(this.todo)?.[0]
    this.todo.delete(value)
    this.done.add(value)

    return {
      done: false,
      value,
    }
  }
}
