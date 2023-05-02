import { Payload } from '@xyo-network/payload-model'

import { PayloadRule } from './PayloadRules'

export type CollectionPointerSchema = 'network.xyo.collection.pointer'
export const CollectionPointerSchema: CollectionPointerSchema = 'network.xyo.collection.pointer'

export type CollectionPointerPayload = Payload<{
  reference: PayloadRule[][]
  schema: CollectionPointerSchema
}>

export const isCollectionPointer = (x?: Payload | null): x is CollectionPointerPayload => x?.schema === CollectionPointerSchema
