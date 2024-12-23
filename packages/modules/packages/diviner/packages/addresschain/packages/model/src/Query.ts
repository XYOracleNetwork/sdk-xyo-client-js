import {
  isPayloadOfSchemaType,
  type PayloadFindFilter, type Query,
} from '@xyo-network/payload-model'

import { AddressChainQuerySchema } from './Schema.ts'

export type AddressChainQueryPayload = Query<{ schema: AddressChainQuerySchema } & PayloadFindFilter>
export const isAddressChainQueryPayload = isPayloadOfSchemaType(AddressChainQuerySchema)
