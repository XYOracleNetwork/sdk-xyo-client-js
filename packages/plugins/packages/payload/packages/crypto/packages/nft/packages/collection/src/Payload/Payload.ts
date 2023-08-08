import { Payload } from '@xyo-network/payload-model'

import { NftCollectionSchema } from '../Schema'
import { NftCollectionInfoFields } from './NftCollectionInfo'

export type NftCollectionInfo = Payload<NftCollectionInfoFields, NftCollectionSchema>

export const isNftCollectionInfo = (payload: Payload): payload is NftCollectionInfo => {
  return payload.schema === NftCollectionSchema
}
