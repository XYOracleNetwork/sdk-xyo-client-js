export type PromiseExSubFunc<T, TResult = T> = (value: T) => TResult
export type PromiseExFunc<T> = (resolve?: PromiseExSubFunc<T, void>, reject?: PromiseExSubFunc<T, void>) => void
export type PromiseExValueFunc<V> = (value?: V) => boolean

export class PromiseEx<T, V = void> extends Promise<T> {
  private _value?: V
  public cancelled?: boolean

  constructor(func: PromiseExFunc<T>, value?: V) {
    super(func)
    this._value = value
  }

  override then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null | undefined,
    onvalue?: (value?: V) => boolean,
  ): Promise<TResult1 | TResult2> {
    if (onvalue?.(this._value)) {
      this.cancelled = true
    }
    return super.then(onfulfilled, onrejected)
  }

  public value(onvalue?: (value?: V) => boolean) {
    if (onvalue?.(this._value)) {
      this.cancelled = true
    }
    return this
  }
}
