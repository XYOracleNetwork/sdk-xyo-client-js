/**
 * An empty object, which means that it does enforce the set of field names, defaulting to an empty set until
 * extended from, which then adds only those additional fields
 */

export type EmptyObject<T extends object = object> = { [K in keyof T]?: never }

export type EmptyObjectOf<T extends object> = EmptyObject<T> extends T ? EmptyObject<T> : never
