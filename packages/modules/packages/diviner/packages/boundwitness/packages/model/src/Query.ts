import type { Query } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

import type { BoundWitnessDivinerPredicate } from './Predicate.ts'
import { BoundWitnessDivinerSchema } from './Schema.ts'

export const BoundWitnessDivinerQuerySchema = asSchema(`${BoundWitnessDivinerSchema}.query`, true)
export type BoundWitnessDivinerQuerySchema = typeof BoundWitnessDivinerQuerySchema

export type BoundWitnessDivinerQueryPayload = Query<{ schema: BoundWitnessDivinerQuerySchema } & BoundWitnessDivinerPredicate>
export const isBoundWitnessDivinerQueryPayload = isPayloadOfSchemaType<BoundWitnessDivinerQueryPayload>(BoundWitnessDivinerQuerySchema)
