import type { PayloadFindFilter, Query } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import { CoinUserLocationsQuerySchema } from './Schema.ts'

export type CoinUserLocationsQueryPayload = Query<{ schema: CoinUserLocationsQuerySchema } & Omit<PayloadFindFilter, 'schema'>>
export const isCoinUserLocationsQueryPayload = isPayloadOfSchemaType<CoinUserLocationsQueryPayload>(CoinUserLocationsQuerySchema)
