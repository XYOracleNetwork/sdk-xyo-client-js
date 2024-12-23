import type { AnyObject, EmptyObject } from '@xylabs/object'
import type { Promisable } from '@xylabs/promise'

import type { ModuleIdentifier } from '../ModuleIdentifier.ts'
import type { ObjectFilter, ObjectFilterOptions } from './ObjectFilter.ts'

export const isObjectResolver = <T extends EmptyObject = AnyObject>(value?: unknown): value is ObjectResolver<T> => {
  return typeof (value as Partial<ObjectResolver<T>>).resolve === 'function'
}

export const ObjectResolverPriority = {
  Disabled: -1,
  VeryLow: 0,
  Low: 1,
  Normal: 2,
  High: 3,
  VeryHigh: 4,
} as const

export type ObjectResolverPriority = typeof ObjectResolverPriority[keyof typeof ObjectResolverPriority]

export interface ObjectResolver<TResult extends EmptyObject> {
  priority: ObjectResolverPriority
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

  resolvePrivate<T extends TResult = TResult>(all: '*', options?: ObjectFilterOptions<T>): Promise<T[]>
  resolvePrivate<T extends TResult = TResult>(id: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promise<T | undefined>
  resolvePrivate<T extends TResult = TResult>(id: ModuleIdentifier, options?: ObjectFilterOptions<T>): Promise<T | T[] | undefined>
}

export interface ObjectResolverInstance<TResult extends EmptyObject> extends ObjectResolver<TResult> {
  addResolver: (resolver: ObjectResolverInstance<TResult>) => this
  removeResolver: (resolver: ObjectResolverInstance<TResult>) => this
}
