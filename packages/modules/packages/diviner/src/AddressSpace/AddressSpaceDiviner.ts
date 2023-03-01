import { XyoQuery } from '@xyo-network/module-model'
import { PayloadFindFilter, XyoPayload } from '@xyo-network/payload-model'

import { AbstractDiviner } from '../AbstractDiviner'

export type AddressSpaceSchema = 'network.xyo.diviner.address'
export const AddressSpaceSchema: AddressSpaceSchema = 'network.xyo.diviner.address'

export type AddressSpaceQuerySchema = 'network.xyo.diviner.address.query'
export const AddressSpaceQuerySchema: AddressSpaceQuerySchema = 'network.xyo.diviner.address.query'

export type AddressSpacePayload = XyoPayload<{ schema: AddressSpaceSchema }>
export const isAddressSpacePayload = (x?: XyoPayload | null): x is AddressSpacePayload => x?.schema === AddressSpaceSchema

export type AddressSpaceQueryPayload = XyoQuery<{ schema: AddressSpaceQuerySchema } & PayloadFindFilter>
export const isAddressSpaceQueryPayload = (x?: XyoPayload | null): x is AddressSpaceQueryPayload => x?.schema === AddressSpaceQuerySchema

export type AddressSpaceDiviner = AbstractDiviner
