export interface Repository<T> {
  find(): T
  get(): T
  insert(value: T): void
}
