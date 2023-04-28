import { Payload } from '@xyo-network/payload-model'

import { CoinUserLocationsSchema } from './Schema'

export type CoinUserLocationsPayload = Payload<{ schema: CoinUserLocationsSchema }>
export const isCoinUserLocationsPayload = (x?: Payload | null): x is CoinUserLocationsPayload => x?.schema === CoinUserLocationsSchema
