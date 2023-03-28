const union = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set([...a, ...b])
}
const intersection = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set(Array.from(a).filter((x) => b.has(x)))
}
const difference = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set(Array.from(a).filter((x) => !b.has(x)))
}

export class WorkingSetCache<TKey> {
  private readonly done: Set<TKey> = new Set<TKey>()
  private readonly todo: Set<TKey> = new Set<TKey>()

  addItems(values: Array<TKey>): void {
    // Add everything to todo that is not already in done
    throw new Error('')
  }
  getBatch(count: number): Array<TKey> {
    // Take count from todo
    // If todo < count then move all of done back over to todo (roll over)
    throw new Error('')
  }
}
