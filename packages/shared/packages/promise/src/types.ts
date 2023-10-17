/* eslint-disable import/no-deprecated */
import { PromiseEx } from './PromiseEx'

/** @deprecated use from @xylabs/promise instead */
export type Promisable<T, V = never> = PromiseEx<T, V> | Promise<T> | T
/** @deprecated use from @xylabs/promise instead */
export type PromisableArray<T, V = never> = Promisable<T[], V>
/** @deprecated use from @xylabs/promise instead */
export type OptionalPromisable<T, V = never> = Promisable<T | undefined, V>
/** @deprecated use from @xylabs/promise instead */
export type OptionalPromisableArray<T, V = never> = PromisableArray<T | undefined, V>
/** @deprecated use from @xylabs/promise instead */
export type NullablePromisable<T, V = never> = Promisable<T | null, V>
/** @deprecated use from @xylabs/promise instead */
export type NullablePromisableArray<T, V = never> = PromisableArray<T | null, V>

/** @description Used to document promises that are being used as Mutexes */
/** @deprecated use from @xylabs/promise instead */
export type AsyncMutex<T> = Promise<T>
