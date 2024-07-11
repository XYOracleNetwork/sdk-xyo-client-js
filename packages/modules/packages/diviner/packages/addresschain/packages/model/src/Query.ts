import { Payload, PayloadFindFilter, Query } from '@xyo-network/payload-model'

import { AddressChainQuerySchema } from './Schema.js'

export type AddressChainQueryPayload = Query<{ schema: AddressChainQuerySchema } & PayloadFindFilter>
export const isAddressChainQueryPayload = (x?: Payload | null): x is AddressChainQueryPayload => x?.schema === AddressChainQuerySchema
