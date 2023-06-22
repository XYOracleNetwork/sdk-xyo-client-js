import { NftInfoPayload } from './Payload'
import { NftSchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<NftInfoPayload> => ({
  schema: NftSchema,
})
