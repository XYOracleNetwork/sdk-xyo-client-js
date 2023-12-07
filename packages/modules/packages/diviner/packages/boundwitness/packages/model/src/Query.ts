import { isPayloadOfSchemaType, Query } from '@xyo-network/payload-model'

import { BoundWitnessDivinerPredicate } from './Predicate'
import { BoundWitnessDivinerSchema } from './Schema'

export type BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`
export const BoundWitnessDivinerQuerySchema: BoundWitnessDivinerQuerySchema = `${BoundWitnessDivinerSchema}.query`

export type BoundWitnessDivinerQueryPayload = Query<{ schema: BoundWitnessDivinerQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessDivinerQueryPayload = isPayloadOfSchemaType<BoundWitnessDivinerQueryPayload>(BoundWitnessDivinerQuerySchema)
