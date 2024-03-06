import { Address } from '@xylabs/hex'
import { AnyObject, EmptyObject, TypeCheck } from '@xylabs/object'

import { ModuleName } from '../ModuleIdentifier'

export type Direction = 'up' | 'down' | 'all'
export type Visibility = 'public' | 'private' | 'all'

export interface ObjectFilterOptions<T extends EmptyObject = AnyObject> {
  direction?: Direction
  identity?: TypeCheck<T>
  maxDepth?: number
  visibility?: Visibility
}

export interface AddressObjectFilter<T extends EmptyObject = AnyObject> extends ObjectFilterOptions<T> {
  address: Address[]
}

export const isAddressObjectFilter = <T extends EmptyObject = AnyObject>(value: unknown): value is AddressObjectFilter<T> =>
  (value as AddressObjectFilter<T>).address !== undefined

export interface NameObjectFilter<T extends EmptyObject = AnyObject> extends ObjectFilterOptions<T> {
  name: ModuleName[]
}

export const isNameObjectFilter = <T extends EmptyObject = AnyObject>(value: unknown): value is NameObjectFilter<T> =>
  (value as NameObjectFilter<T>).name !== undefined

export interface QueryObjectFilter<T extends EmptyObject = AnyObject> extends ObjectFilterOptions<T> {
  query: string[][]
}

export const isQueryObjectFilter = <T extends EmptyObject = AnyObject>(value: unknown): value is QueryObjectFilter<T> =>
  (value as QueryObjectFilter<T>).query !== undefined

export type AnyObjectFilter<T extends EmptyObject = AnyObject> = Partial<AddressObjectFilter<T>> &
  Partial<NameObjectFilter<T>> &
  Partial<QueryObjectFilter<T>>

export type ObjectFilter<T extends EmptyObject> = ObjectFilterOptions<T> | AddressObjectFilter<T> | NameObjectFilter<T> | QueryObjectFilter<T>
