import { type Hash, isHash } from '@xylabs/hex'
import { AsObjectFactory } from '@xylabs/object'

import type { Payload } from '../Payload.ts'

export interface DataHashStorageMeta {
  _dataHash: Hash
}

export type WithDataHashStorageMeta<T extends Payload = Payload> = T & DataHashStorageMeta
export type WithPartialDataHashStorageMeta<T extends Payload = Payload> = Partial<WithDataHashStorageMeta<T>>

export const isDataHashStorageMeta = (value: unknown): value is DataHashStorageMeta => {
  return isHash((value as WithDataHashStorageMeta)?._dataHash)
}

export const asDataHashStorageMeta = AsObjectFactory.create<DataHashStorageMeta>(isDataHashStorageMeta)
export const asOptionalDataHashStorageMeta = AsObjectFactory.createOptional<DataHashStorageMeta>(isDataHashStorageMeta)
