export type Promisable<T> = Promise<T> | T
export type PromisableArray<T> = Promisable<T[]>
export type OptionalPromisable<T> = Promisable<T | undefined>
export type OptionalPromisableArray<T> = PromisableArray<T | undefined>
export type NullablePromisable<T> = Promisable<T | null>
export type NullablePromisableArray<T> = PromisableArray<T | null>
