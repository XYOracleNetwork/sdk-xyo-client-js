import { Payload } from '@xyo-network/payload-model'

import { PointerPayload } from './Pointer'

export type CollectionPointerSchema = 'network.xyo.collection.pointer'
export const CollectionPointerSchema: CollectionPointerSchema = 'network.xyo.collection.pointer'

export type CollectionPointerPayload = PointerPayload & {
  schema: CollectionPointerSchema
}

export const isCollectionPointer = (x?: Payload | null): x is CollectionPointerPayload => x?.schema === CollectionPointerSchema
