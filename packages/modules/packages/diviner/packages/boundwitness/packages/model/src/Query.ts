import { isPayloadOfSchemaType, Query } from '@xyo-network/payload-model'

import { BoundWitnessDivinerPredicate } from './Predicate.js'
import { BoundWitnessDivinerSchema } from './Schema.js'

export type BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`
export const BoundWitnessDivinerQuerySchema: BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`

export type BoundWitnessDivinerQueryPayload = Query<{ schema: BoundWitnessDivinerQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessDivinerQueryPayload = isPayloadOfSchemaType<BoundWitnessDivinerQueryPayload>(BoundWitnessDivinerQuerySchema)
