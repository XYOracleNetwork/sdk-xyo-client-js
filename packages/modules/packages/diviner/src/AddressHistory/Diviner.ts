import { XyoQuery } from '@xyo-network/module-model'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner } from '../AbstractDiviner'

export type AddressHistorySchema = 'network.xyo.diviner.address.history'
export const AddressHistorySchema: AddressHistorySchema = 'network.xyo.diviner.address.history'

export type AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'
export const AddressHistoryQuerySchema: AddressHistoryQuerySchema = 'network.xyo.diviner.address.history.query'

export type AddressHistoryPayload = XyoPayload<{ schema: AddressHistorySchema }>
export const isAddressHistoryPayload = (x?: XyoPayload | null): x is AddressHistoryPayload => x?.schema === AddressHistorySchema

export type AddressHistoryQueryPayload = XyoQuery<{ schema: AddressHistoryQuerySchema } & PayloadFindFilter>
export const isAddressHistoryQueryPayload = (x?: XyoPayload | null): x is AddressHistoryQueryPayload => x?.schema === AddressHistoryQuerySchema

export type AddressHistoryDiviner = AbstractDiviner
