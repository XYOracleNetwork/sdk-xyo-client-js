import { createPayloadPlugin } from '@xyo-network/payload-plugin'

import { AddressTransactionHistoryPayload } from './Payload'
import { AddressTransactionHistorySchema } from './Schema'
import { addressTransactionHistoryPayloadTemplate } from './Template'

export const AddressTransactionHistoryPayloadPlugin = () =>
  createPayloadPlugin<AddressTransactionHistoryPayload>({
    schema: AddressTransactionHistorySchema,
    template: addressTransactionHistoryPayloadTemplate,
  })
