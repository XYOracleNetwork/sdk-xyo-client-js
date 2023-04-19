import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessDivinerPredicate } from './BoundWitnessDivinerPredicate'

export type BoundWitnessQuerySchema = 'network.xyo.diviner.boundwitness.query'
export const BoundWitnessQuerySchema: BoundWitnessQuerySchema = 'network.xyo.diviner.boundwitness.query'

export type BoundWitnessQueryPayload = Query<{ schema: BoundWitnessQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessQueryPayload = (x?: Payload | null): x is BoundWitnessQueryPayload => x?.schema === BoundWitnessQuerySchema
