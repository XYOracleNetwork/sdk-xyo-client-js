import { AnyObject, EmptyObject } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from '../ModuleIdentifier'
import { ObjectFilter, ObjectFilterOptions } from './ObjectFilter'

export const isObjectResolver = <T extends EmptyObject = AnyObject>(value?: unknown): value is ObjectResolver<T> => {
  // eslint-disable-next-line deprecation/deprecation
  return typeof (value as Partial<ObjectResolver<T>>).resolve === 'function'
}

export interface ObjectResolver<TResult extends EmptyObject> {
  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  resolve<T extends TResult = TResult>(): Promisable<T | undefined>
  resolve<T extends TResult = TResult>(all: '*', options?: ObjectFilterOptions<T>): Promisable<T[]>
  resolve<T extends TResult = TResult>(id: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promisable<T | undefined>
  resolve<T extends TResult = TResult>(filter: ObjectFilter<T>, options?: ObjectFilterOptions<T>): Promisable<T[]>
  /** @deprecated do not pass undefined.  If trying to get all, pass '*' */
  resolve<T extends TResult = TResult>(filter?: ObjectFilter<T>, options?: ObjectFilterOptions<T>): Promisable<T[]>
  resolve<T extends TResult = TResult>(
    idOrFilter?: ObjectFilter<T> | ModuleIdentifier,
    options?: ObjectFilterOptions<T>,
  ): Promisable<T | T[] | undefined>
}

export interface ObjectResolverInstance<TResult extends EmptyObject> extends ObjectResolver<TResult> {
  addResolver: (resolver: ObjectResolverInstance<TResult>) => this
  removeResolver: (resolver: ObjectResolverInstance<TResult>) => this
}
