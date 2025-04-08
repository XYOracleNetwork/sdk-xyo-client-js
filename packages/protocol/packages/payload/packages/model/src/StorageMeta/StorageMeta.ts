import { AsObjectFactory } from '@xylabs/object'

import type { Payload } from '../Payload.ts'
import type { HashStorageMeta } from './Hash.ts'
import { isHashStorageMeta } from './Hash.ts'
import type { SequenceStorageMeta } from './Sequence.ts'
import { isSequenceStorageMeta } from './Sequence.ts'

export interface StorageMeta extends SequenceStorageMeta, HashStorageMeta {}

export type WithStorageMeta<T extends Payload = Payload> = T & StorageMeta
export type WithPartialStorageMeta<T extends Payload = Payload> = T & Partial<StorageMeta>

export const isStorageMeta = (value: unknown): value is StorageMeta => {
  return isSequenceStorageMeta(value) && isHashStorageMeta(value)
}

export const asStorageMeta = AsObjectFactory.create(isStorageMeta)
export const asOptionalStorageMeta = AsObjectFactory.createOptional(isStorageMeta)
