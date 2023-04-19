import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessDivinerPredicate } from './Predicate'
import { BoundWitnessDivinerSchema } from './Schema'

export type BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`
export const BoundWitnessQuerySchema: BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`

export type BoundWitnessDivinerQueryPayload = Query<{ schema: BoundWitnessDivinerQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessDivinerQueryPayload = (x?: Payload | null): x is BoundWitnessDivinerQueryPayload => x?.schema === BoundWitnessQuerySchema
