import { Query } from '@xyo-network/module-model'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'

export type AddressHistorySchema = 'network.xyo.diviner.address.history'
export const AddressHistorySchema: AddressHistorySchema = 'network.xyo.diviner.address.history'

export type AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'
export const AddressHistoryQuerySchema: AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'

export type AddressHistoryPayload = Payload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: Payload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = Query<{ schema: AddressHistoryQuerySchema } & PayloadFindFilter>
export const isAddressHistoryQueryPayload = (x?: Payload | null): x is AddressHistoryQueryPayload => x?.schema === AddressHistoryQuerySchema
