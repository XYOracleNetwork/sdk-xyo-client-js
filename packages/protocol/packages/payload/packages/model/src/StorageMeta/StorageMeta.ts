import { AsObjectFactory } from '@xylabs/object'

import { Payload } from '../Payload.ts'
import { HashStorageMeta, isHashStorageMeta } from './Hash.ts'
import { isSequenceStorageMeta, SequenceStorageMeta } from './Sequence.ts'

export interface StorageMeta extends SequenceStorageMeta, HashStorageMeta {}

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta
export type WithPartialStorageMeta<T extends Payload = Payload> = T & Partial<StorageMeta>

export const isStorageMeta = (value: unknown): value is StorageMeta => {
  return isSequenceStorageMeta(value) && isHashStorageMeta(value)
}

export const asStorageStorageMeta = AsObjectFactory.create(isStorageMeta)
export const asOptionalStorageMeta = AsObjectFactory.createOptional(isStorageMeta)
