export interface Handler<T, R> {
  handle(input: T): Promise<R>
}
