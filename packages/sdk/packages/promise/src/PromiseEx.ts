export type PromiseExSubFunc<T, TResult = T> = (value: T) => TResult | PromiseLike<TResult>
export type PromiseExFunc<T, TResult = T> = (resolve?: PromiseExSubFunc<T, void> | null, reject?: PromiseExSubFunc<T, void> | null) => TResult

export class PromiseEx<T, V> implements Promise<T> {
  [Symbol.toStringTag] = 'PromiseEx'

  private promise: Promise<T>
  public value?: V

  constructor(func: PromiseExFunc<T>, value?: V) {
    this.value = value
    this.promise = new Promise<T>(func)
  }

  public then<TResult1 = T, TResult2 = never>(
    onfulfilled?: PromiseExSubFunc<T, TResult1> | null | undefined,
    onrejected?: PromiseExSubFunc<T, TResult2> | null | undefined,
  ): Promise<TResult1 | TResult2> {
    return this.promise.then(onfulfilled, onrejected)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined): Promise<T | TResult> {
    return this.promise.catch(onrejected)
  }

  public finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this.promise.finally(onfinally)
  }
}
