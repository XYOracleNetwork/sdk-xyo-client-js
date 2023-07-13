import { Payload, PayloadFindFilter, Query } from '@xyo-network/payload-model'

import { CoinUserLocationsQuerySchema } from './Schema'

export type CoinUserLocationsQueryPayload = Query<{ schema: CoinUserLocationsQuerySchema } & PayloadFindFilter>
export const isCoinUserLocationsQueryPayload = (x?: Payload | null): x is CoinUserLocationsQueryPayload => x?.schema === CoinUserLocationsQuerySchema
