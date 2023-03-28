export const union = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set([...a, ...b])
}

export const intersection = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set(Array.from(a).filter((x) => b.has(x)))
}

export const difference = <TKey>(a: Set<TKey>, b: Set<TKey>): Set<TKey> => {
  return new Set(Array.from(a).filter((x) => !b.has(x)))
}
