import { Query } from '@xyo-network/module-model'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'

import { AbstractDiviner } from '../AbstractDiviner'

export type AddressSpaceSchema = 'network.xyo.diviner.address.space'
export const AddressSpaceSchema: AddressSpaceSchema = 'network.xyo.diviner.address.space'

export type AddressSpaceQuerySchema = 'network.xyo.diviner.address.space.query'
export const AddressSpaceQuerySchema: AddressSpaceQuerySchema = 'network.xyo.diviner.address.space.query'

export type AddressSpacePayload = Payload<{ schema: AddressSpaceSchema }>
export const isAddressSpacePayload = (x?: Payload | null): x is AddressSpacePayload => x?.schema === AddressSpaceSchema

export type AddressSpaceQueryPayload = Query<{ schema: AddressSpaceQuerySchema } & PayloadFindFilter>
export const isAddressSpaceQueryPayload = (x?: Payload | null): x is AddressSpaceQueryPayload => x?.schema === AddressSpaceQuerySchema

export type AddressSpaceDiviner = AbstractDiviner
