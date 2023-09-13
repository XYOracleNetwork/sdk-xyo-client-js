import { AnyObject } from './AnyObject'

export type WithAdditional<T extends AnyObject, TAdditional extends AnyObject | void = void> = TAdditional extends AnyObject ? T & TAdditional : T
