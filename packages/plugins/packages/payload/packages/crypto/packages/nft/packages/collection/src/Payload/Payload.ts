import { Payload } from '@xyo-network/payload-model'

import { NftCollectionSchema } from '../Schema'
import { NftCollectionInfoFields } from './NftCollectionInfo'

export type NftCollectionInfoPayload = Payload<NftCollectionInfoFields, NftCollectionSchema>

export const isNftCollectionInfoPayload = (payload: Payload): payload is NftCollectionInfoPayload => {
  return payload.schema === NftCollectionSchema
}
