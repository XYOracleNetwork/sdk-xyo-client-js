import { Query } from '@xyo-network/module-model'
import { Payload, PayloadFindFilter } from '@xyo-network/payload-model'

import { AddressChainQuerySchema } from './Schema'

export type AddressChainQueryPayload = Query<{ schema: AddressChainQuerySchema } & PayloadFindFilter>
export const isAddressChainQueryPayload = (x?: Payload | null): x is AddressChainQueryPayload => x?.schema === AddressChainQuerySchema
