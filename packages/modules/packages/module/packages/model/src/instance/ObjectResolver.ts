import { AnyObject, EmptyObject } from '@xylabs/object'
import { Promisable } from '@xylabs/promise'

import { ModuleIdentifier } from './ModuleIdentifier'
import { ObjectFilter, ObjectFilterOptions } from './ObjectFilter'

export const isObjectResolver = <T extends EmptyObject = AnyObject>(value?: unknown): value is ObjectResolver<T> => {
  return typeof (value as Partial<ObjectResolver<T>>).resolve === 'function'
}

export interface ObjectResolver<TResult extends EmptyObject> {
  resolve<T extends TResult = TResult>(filter?: ObjectFilter<T>, options?: ObjectFilterOptions<T>): Promisable<T[]>
  resolve<T extends TResult = TResult>(nameOrAddress: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promisable<T | undefined>
  resolve<T extends TResult = TResult>(
    nameOrAddressOrFilter?: ObjectFilter<T> | ModuleIdentifier,
    options?: ObjectFilterOptions<T>,
  ): Promisable<T | T[] | undefined>
}

export interface ObjectResolverInstance<TResult extends EmptyObject> extends ObjectResolver<TResult> {
  addResolver: (resolver: ObjectResolverInstance<TResult>) => this
  removeResolver: (resolver: ObjectResolverInstance<TResult>) => this
}
