import {
  isPayloadOfSchemaType,
  PayloadFindFilter, Query,
} from '@xyo-network/payload-model'

import { AddressChainQuerySchema } from './Schema.ts'

export type AddressChainQueryPayload = Query<{ schema: AddressChainQuerySchema } & Omit<PayloadFindFilter, 'schema'>>
export const isAddressChainQueryPayload = isPayloadOfSchemaType<AddressChainQueryPayload>(AddressChainQuerySchema)
