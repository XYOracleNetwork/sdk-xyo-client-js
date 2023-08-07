import { Payload } from '@xyo-network/payload-model'

import { NftCollectionSchema } from '../Schema'
import { NftCollectionInfo } from './NftCollectionInfo'

export type NftCollectionInfoPayload = Payload<NftCollectionInfo & { schema: NftCollectionSchema }>

export const isNftCollectionInfoPayload = (payload: Payload): payload is NftCollectionInfoPayload => {
  return payload.schema === NftCollectionSchema
}
