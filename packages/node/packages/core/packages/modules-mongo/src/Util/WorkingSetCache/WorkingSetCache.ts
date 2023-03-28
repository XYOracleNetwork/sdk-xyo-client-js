export class WorkingSetCache<TKey> {
  private readonly done: Set<TKey> = new Set<TKey>()
  private readonly todo: Set<TKey> = new Set<TKey>()

  addItems(values: Array<TKey>): void {
    throw new Error('')
  }
  getBatch(count: number): Array<TKey> {
    throw new Error('')
  }
}
