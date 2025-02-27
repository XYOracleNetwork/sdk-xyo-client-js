import type {
  Payload, PayloadFindFilter, Query,
} from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const AddressHistorySchema = 'network.xyo.diviner.address.history' as const
export type AddressHistorySchema = typeof AddressHistorySchema

export const AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query' as const
export type AddressHistoryQuerySchema = typeof AddressHistoryQuerySchema

export type AddressHistoryPayload = Payload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: Payload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = Query<{ schema: AddressHistoryQuerySchema } & Omit<PayloadFindFilter, 'schema'>>
export const isAddressHistoryQueryPayload = isPayloadOfSchemaType<AddressHistoryQueryPayload>(AddressHistoryQuerySchema)
