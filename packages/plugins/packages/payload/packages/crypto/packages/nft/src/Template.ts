import { CryptoWalletNftPayload } from './Payload'
import { CryptoWalletNftSchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<CryptoWalletNftPayload> => ({
  schema: CryptoWalletNftSchema,
})
