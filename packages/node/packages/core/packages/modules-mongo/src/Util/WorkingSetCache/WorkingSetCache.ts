export class WorkingSetCache<TKey> {
  addItems(values: Array<TKey>): void {
    throw new Error('')
  }
  getBatch(count: number): Array<TKey> {
    throw new Error('')
  }
}
