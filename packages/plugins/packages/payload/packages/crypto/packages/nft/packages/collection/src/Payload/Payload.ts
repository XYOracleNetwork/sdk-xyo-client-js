import { Payload } from '@xyo-network/payload-model'

import { NftCollectionSchema } from '../Schema'
import { NftCollectionAttributeMetrics } from './NftCollectionAttributeMetrics'
import { NftCollectionInfo } from './NftCollectionInfo'

export type NftCollectionInfoPayload = Payload<NftCollectionInfo & NftCollectionAttributeMetrics & { schema: NftCollectionSchema }>

export const isNftCollectionInfoPayload = (payload: Payload): payload is NftCollectionInfoPayload => {
  return payload.schema === NftCollectionSchema
}
