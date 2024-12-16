import {
  isPayloadOfSchemaType,
  type PayloadFindFilter, type Query,
} from '@xyo-network/payload-model'

import { CoinUserLocationsQuerySchema } from './Schema.ts'

export type CoinUserLocationsQueryPayload = Query<{ schema: CoinUserLocationsQuerySchema } & PayloadFindFilter>
export const isCoinUserLocationsQueryPayload = isPayloadOfSchemaType(CoinUserLocationsQuerySchema)
