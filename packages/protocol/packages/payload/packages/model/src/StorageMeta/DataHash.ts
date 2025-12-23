import type { Hash } from '@xylabs/sdk-js'
import { AsObjectFactory, isHash } from '@xylabs/sdk-js'

import type { Payload } from '../Payload.ts'

export interface DataHashMeta {
  _dataHash: Hash
}

export type WithDataHashMeta<T extends Payload = Payload> = T & DataHashMeta
export type WithPartialDataHashMeta<T extends Payload = Payload> = Partial<WithDataHashMeta<T>>

export const isDataHashMeta = (value: unknown): value is DataHashMeta => {
  return isHash((value as WithDataHashMeta)?._dataHash)
}

export const asDataHashMeta = AsObjectFactory.create<DataHashMeta>(isDataHashMeta)
export const asOptionalDataHashMeta = AsObjectFactory.createOptional<DataHashMeta>(isDataHashMeta)

/** @deprecated use DataHashMeta instead */
export interface DataHashStorageMeta extends DataHashMeta {}

/** @deprecated use WithDataHashMeta instead */
export type WithDataHashStorageMeta<T extends Payload = Payload> = WithDataHashMeta<T>

/** @deprecated use WithPartialDataHashMeta instead */
export type WithPartialDataHashStorageMeta<T extends Payload = Payload> = WithPartialDataHashMeta<T>

/** @deprecated use isDataHashMeta instead */
export const isDataHashStorageMeta = isDataHashMeta

/** @deprecated use asDataHashMeta instead */
export const asDataHashStorageMeta = asDataHashMeta

/** @deprecated use asOptionalDataHashMeta instead */
export const asOptionalDataHashStorageMeta = asOptionalDataHashMeta
