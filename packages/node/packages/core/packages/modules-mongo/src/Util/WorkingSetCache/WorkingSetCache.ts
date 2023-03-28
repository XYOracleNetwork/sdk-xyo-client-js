import { difference, union } from './SetOperations'

export class WorkingSetCache<TKey> implements Iterator<TKey> {
  protected done: Set<TKey> = new Set<TKey>()
  protected todo: Set<TKey> = new Set<TKey>()

  addItems(values: Iterable<TKey> | ReadonlyArray<TKey> | null | undefined): void {
    // Add everything to todo that is not already in done
    const incoming = new Set(values)
    this.todo = new Set(difference(this.done, incoming))
  }
  getBatch(count: number): Array<TKey> {
    // Take count from todo
    const todo = Array.from(this.todo)
    const batch = todo.slice(0, count)
    const remaining = todo.slice(count)
    // Simulate rollover by moving all of done back to todo
    if (remaining.length < 1) {
      this.todo = new Set(this.done)
      this.done = new Set()
    } else {
      this.todo = new Set(remaining)
      this.done = union(this.done, new Set(batch))
    }
    return batch
  }
  next(...args: [] | [undefined]): IteratorResult<TKey, any> {
    throw new Error('Method not implemented.')
  }
  return?(value?: any): IteratorResult<TKey, any> {
    throw new Error('Method not implemented.')
  }
  throw?(e?: any): IteratorResult<TKey, any> {
    throw new Error('Method not implemented.')
  }
}
