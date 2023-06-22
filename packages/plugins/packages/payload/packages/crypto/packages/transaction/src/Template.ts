import { AddressTransactionHistoryPayload } from './Payload'
import { AddressTransactionHistorySchema } from './Schema'

export const addressTransactionHistoryPayloadTemplate = (): Partial<AddressTransactionHistoryPayload> => ({
  schema: AddressTransactionHistorySchema,
})
