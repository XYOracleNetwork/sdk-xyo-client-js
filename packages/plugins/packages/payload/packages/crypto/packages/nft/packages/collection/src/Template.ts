import { NftCollectionInfo } from './Payload'
import { NftCollectionSchema } from './Schema'

export const cryptoNftCollectionPayloadTemplate = (): Partial<NftCollectionInfo> => ({
  schema: NftCollectionSchema,
})
