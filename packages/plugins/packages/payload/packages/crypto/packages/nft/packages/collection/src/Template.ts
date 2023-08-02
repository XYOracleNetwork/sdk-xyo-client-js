import { NftCollectionInfoPayload } from './Payload'
import { NftCollectionSchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<NftCollectionInfoPayload> => ({
  schema: NftCollectionSchema,
})
