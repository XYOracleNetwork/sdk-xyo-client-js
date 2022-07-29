export type StringKeyObject = { [key: string]: unknown }
export type WithAdditional<T> = T & StringKeyObject
