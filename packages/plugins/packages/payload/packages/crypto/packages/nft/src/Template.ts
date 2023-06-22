import { CryptoWalletNftPayload } from './Payload'
import { NftSchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<CryptoWalletNftPayload> => ({
  schema: NftSchema,
})
