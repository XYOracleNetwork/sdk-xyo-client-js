import { XyoDiviner } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module'
import { XyoPayload, XyoPayloadFindFilter } from '@xyo-network/payload'

export type AddressHistoryQuerySchema = 'network.xyo.diviner.address.query'
export const AddressHistoryQuerySchema: AddressHistoryQuerySchema = 'network.xyo.diviner.address.query'

export type AddressHistoryQueryPayload = XyoQuery<{ address: string; schema: AddressHistoryQuerySchema } & XyoPayloadFindFilter>
export const isAddressHistoryQueryPayload = (x?: XyoPayload): x is AddressHistoryQueryPayload => x?.schema === AddressHistoryQuerySchema

export type AddressHistoryDiviner = XyoDiviner
