import { XyoDiviner } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module'
import { XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'

export type AddressHistorySchema = 'network.xyo.diviner.address'
export const AddressHistorySchema: AddressHistorySchema = 'network.xyo.diviner.address'

export type AddressHistoryQuerySchema = 'network.xyo.diviner.address.query'
export const AddressHistoryQuerySchema: AddressHistoryQuerySchema = 'network.xyo.diviner.address.query'

export type AddressHistoryPayload = XyoPayload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: XyoPayload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = XyoQuery<{ schema: AddressHistoryQuerySchema } & XyoPayloadFindFilter>
export const isAddressHistoryQueryPayload = (x?: XyoPayload | null): x is AddressHistoryQueryPayload => x?.schema === AddressHistoryQuerySchema

export type AddressHistoryDiviner = XyoDiviner
