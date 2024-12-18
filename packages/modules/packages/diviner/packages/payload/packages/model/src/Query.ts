import type { EmptyObject } from '@xylabs/object'
import { isPayloadOfSchemaType, type Query } from '@xyo-network/payload-model'

import type { PayloadDivinerPredicate } from './Predicate.ts'
import { PayloadDivinerSchema } from './Schema.ts'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>
>
export const isPayloadDivinerQueryPayload = isPayloadOfSchemaType(PayloadDivinerQuerySchema)
