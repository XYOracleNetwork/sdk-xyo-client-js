import { EmptyObject } from './EmptyObject'

export type StringKeyObject = { [key: string]: unknown }
export type WithAdditional<T extends EmptyObject = EmptyObject> = T & StringKeyObject
