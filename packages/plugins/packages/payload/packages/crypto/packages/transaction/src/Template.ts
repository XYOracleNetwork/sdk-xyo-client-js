import { AddressTransactionHistoryPayload } from './Payload'
import { AddressTransactionHistorySchema } from './Schema'

export const cryptoWalletNftPayloadTemplate = (): Partial<AddressTransactionHistoryPayload> => ({
  schema: AddressTransactionHistorySchema,
})
