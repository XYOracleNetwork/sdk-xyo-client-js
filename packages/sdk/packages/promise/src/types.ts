import { PromiseEx } from './PromiseEx'

export type Promisable<T, V = never> = PromiseEx<T, V> | Promise<T> | T
export type PromisableArray<T, V = never> = Promisable<T[], V>
export type OptionalPromisable<T, V = never> = Promisable<T | undefined, V>
export type OptionalPromisableArray<T, V = never> = PromisableArray<T | undefined, V>
export type NullablePromisable<T, V = never> = Promisable<T | null, V>
export type NullablePromisableArray<T, V = never> = PromisableArray<T | null, V>
