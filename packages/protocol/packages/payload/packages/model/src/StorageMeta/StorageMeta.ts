import { AsObjectFactory } from '@xylabs/object'

import type { Payload } from '../Payload.ts'
import { type HashStorageMeta, isHashStorageMeta } from './Hash.ts'
import { isSequenceStorageMeta, type SequenceStorageMeta } from './Sequence.ts'

export interface StorageMeta extends SequenceStorageMeta, HashStorageMeta {}

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta
export type WithPartialStorageMeta<T extends Payload = Payload> = Partial<WithStorageMeta<T>>

export const isStorageMeta = (value: unknown): value is StorageMeta => {
  return isSequenceStorageMeta(value) && isHashStorageMeta(value)
}

export const asStorageStorageMeta = AsObjectFactory.create(isStorageMeta)
export const asOptionalStorageMeta = AsObjectFactory.createOptional(isStorageMeta)
