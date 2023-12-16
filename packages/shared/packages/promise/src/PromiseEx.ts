/** @deprecated use from @xylabs/promise instead */
export type PromiseExSubFunction<T, TResult = T> = (value: T) => TResult
/** @deprecated use from @xylabs/promise instead */
export type PromiseExFunction<T> = (resolve?: PromiseExSubFunction<T, void>, reject?: PromiseExSubFunction<T, void>) => void
/** @deprecated use from @xylabs/promise instead */
export type PromiseExValueFunction<V> = (value?: V) => boolean

/** @deprecated use from @xylabs/promise instead */
export class PromiseEx<T, V = void> extends Promise<T> {
  cancelled?: boolean
  private _value?: V

  constructor(function_: PromiseExFunction<T>, value?: V) {
    super(function_)
    this._value = value
  }

  // eslint-disable-next-line unicorn/no-thenable
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

  value(onvalue?: (value?: V) => boolean) {
    if (onvalue?.(this._value)) {
      this.cancelled = true
    }
    return this
  }
}
