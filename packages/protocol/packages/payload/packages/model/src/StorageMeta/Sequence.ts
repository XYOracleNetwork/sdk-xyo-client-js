import { AsObjectFactory } from '@xylabs/object'

import { Payload } from '../Payload.ts'
import { Sequence } from './sequence/index.ts'

export interface SequenceStorageMeta {
  _sequence: Sequence
}

export type WithSequenceStorageMeta<T extends Payload = Payload> = T & SequenceStorageMeta
export type WithPartialSequenceStorageMeta<T extends Payload = Payload> = Partial<WithSequenceStorageMeta<T>>

export const isSequenceStorageMeta = (value: unknown): value is SequenceStorageMeta => {
  return (value as WithSequenceStorageMeta)?._sequence != undefined
}

export const asSequenceStorageMeta = AsObjectFactory.create(isSequenceStorageMeta)
export const asOptionalSequenceStorageMeta = AsObjectFactory.createOptional(isSequenceStorageMeta)
