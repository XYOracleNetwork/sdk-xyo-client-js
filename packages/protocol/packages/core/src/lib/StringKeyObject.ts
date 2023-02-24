import { AnyObject } from './AnyObject'

export type StringKeyObject = { [key: string]: unknown }
export type WithAdditional<T extends AnyObject = AnyObject> = T & StringKeyObject
