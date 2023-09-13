import { AnyObject } from './AnyObject'

export type StringKeyObject = { [key: string]: unknown }
export type WithAdditional<T, TAdditional extends AnyObject | undefined = undefined> = TAdditional extends AnyObject ? T & TAdditional : T
