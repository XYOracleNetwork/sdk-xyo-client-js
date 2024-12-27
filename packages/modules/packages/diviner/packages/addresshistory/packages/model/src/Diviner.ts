import {
  isPayloadOfSchemaType,
  type Payload, type PayloadFindFilter, type Query,
} from '@xyo-network/payload-model'

export type AddressHistorySchema = 'network.xyo.diviner.address.history'
export const AddressHistorySchema: AddressHistorySchema = 'network.xyo.diviner.address.history'

export type AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'
export const AddressHistoryQuerySchema: AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'

export type AddressHistoryPayload = Payload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: Payload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = Query<{ schema: AddressHistoryQuerySchema } & Omit<PayloadFindFilter, 'schema'>>
export const isAddressHistoryQueryPayload = isPayloadOfSchemaType<AddressHistoryQueryPayload>(AddressHistoryQuerySchema)
