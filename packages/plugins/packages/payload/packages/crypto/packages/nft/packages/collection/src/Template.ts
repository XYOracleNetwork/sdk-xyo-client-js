import { NftCollectionInfoPayload } from './Payload'
import { NftCollectionSchema } from './Schema'

export const cryptoNftCollectionPayloadTemplate = (): Partial<NftCollectionInfoPayload> => ({
  schema: NftCollectionSchema,
})
