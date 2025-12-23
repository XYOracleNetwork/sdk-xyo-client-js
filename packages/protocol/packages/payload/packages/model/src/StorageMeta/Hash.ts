import type { Hash } from '@xylabs/sdk-js'
import { AsObjectFactory, isHash } from '@xylabs/sdk-js'

import type { Payload } from '../Payload.ts'
import type { DataHashMeta } from './DataHash.ts'
import { isDataHashMeta } from './DataHash.ts'

export interface HashMeta extends DataHashMeta {
  _hash: Hash
}

export type WithHashMeta<T extends Payload = Payload> = T & HashMeta
export type WithPartialHashMeta<T extends Payload = Payload> = Partial<WithHashMeta<T>>

export const isHashMeta = (value: unknown): value is HashMeta => {
  return isDataHashMeta(value) && isHash((value as WithHashMeta)?._hash)
}

export const asHashMeta = AsObjectFactory.create<HashMeta>(isHashMeta)
export const asOptionalHashMeta = AsObjectFactory.createOptional<HashMeta>(isHashMeta)

/** @deprecated use HashMeta instead */
export interface HashStorageMeta extends HashMeta {}

/** @deprecated use WithHashMeta instead */
export type WithHashStorageMeta<T extends Payload = Payload> = WithHashMeta<T>

/** @deprecated use WithPartialHashMeta instead */
export type WithPartialHashStorageMeta<T extends Payload = Payload> = Partial<WithHashMeta<T>>

/** @deprecated use isHashMeta instead */
export const isHashStorageMeta = isHashMeta

/** @deprecated use asHashMeta instead */
export const asHashStorageMeta = asHashMeta

/** @deprecated use asOptionalHashMeta instead */
export const asOptionalHashStorageMeta = asOptionalHashMeta
