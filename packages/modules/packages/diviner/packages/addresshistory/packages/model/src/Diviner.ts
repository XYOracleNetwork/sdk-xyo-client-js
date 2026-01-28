import type {
  Payload, PayloadFindFilter, Query,
} from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

export const AddressHistorySchema = asSchema('network.xyo.diviner.address.history', true)
export type AddressHistorySchema = typeof AddressHistorySchema

export const AddressHistoryQuerySchema = asSchema('network.xyo.diviner.address.history.query', true)
export type AddressHistoryQuerySchema = typeof AddressHistoryQuerySchema

export type AddressHistoryPayload = Payload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: Payload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = Query<{ schema: AddressHistoryQuerySchema } & Omit<PayloadFindFilter, 'schema'>>
export const isAddressHistoryQueryPayload = isPayloadOfSchemaType<AddressHistoryQueryPayload>(AddressHistoryQuerySchema)
