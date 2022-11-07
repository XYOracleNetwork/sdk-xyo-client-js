export type Transport<T> = {
  enqueue(item: T): Promise<string>
  get(id: string): Promise<T | null | undefined>
}
