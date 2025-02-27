import { isPayloadOfSchemaType, Query } from '@xyo-network/payload-model'

import { BoundWitnessDivinerPredicate } from './Predicate.ts'
import { BoundWitnessDivinerSchema } from './Schema.ts'

export type BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`
export const BoundWitnessDivinerQuerySchema: BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`

export type BoundWitnessDivinerQueryPayload = Query<{ schema: BoundWitnessDivinerQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessDivinerQueryPayload = isPayloadOfSchemaType<BoundWitnessDivinerQueryPayload>(BoundWitnessDivinerQuerySchema)
