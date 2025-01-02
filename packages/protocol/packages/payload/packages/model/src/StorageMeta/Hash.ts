import { type Hash, isHash } from '@xylabs/hex'
import { AsObjectFactory } from '@xylabs/object'

import type { Payload } from '../Payload.ts'
import { type DataHashStorageMeta, isDataHashStorageMeta } from './DataHash.ts'

export interface HashStorageMeta extends DataHashStorageMeta {
  _hash: Hash
}

export type WithHashStorageMeta<T extends Payload = Payload> = T & HashStorageMeta
export type WithPartialHashStorageMeta<T extends Payload = Payload> = Partial<WithHashStorageMeta<T>>

export const isHashStorageMeta = (value: unknown): value is HashStorageMeta => {
  return isDataHashStorageMeta(value) && isHash((value as WithHashStorageMeta)?._hash)
}

export const asHashStorageMeta = AsObjectFactory.create<HashStorageMeta>(isHashStorageMeta)
export const asOptionalHashStorageMeta = AsObjectFactory.createOptional<HashStorageMeta>(isHashStorageMeta)
