import { NftInfo } from './Payload'
import { NftSchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<NftInfo> => ({
  schema: NftSchema,
})
