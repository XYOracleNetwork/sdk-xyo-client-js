/* eslint-disable deprecation/deprecation */
/** @deprecated use from @xyo-network/promise instead */
export type Promisable<T> = Promise<T> | T
/** @deprecated use from @xyo-network/promise instead */
export type PromisableArray<T> = Promisable<T[]>
/** @deprecated use from @xyo-network/promise instead */
export type OptionalPromisable<T> = Promisable<T | undefined>
/** @deprecated use from @xyo-network/promise instead */
export type OptionalPromisableArray<T> = PromisableArray<T | undefined>
/** @deprecated use from @xyo-network/promise instead */
export type NullablePromisable<T> = Promisable<T | null>
/** @deprecated use from @xyo-network/promise instead */
export type NullablePromisableArray<T> = PromisableArray<T | null>
