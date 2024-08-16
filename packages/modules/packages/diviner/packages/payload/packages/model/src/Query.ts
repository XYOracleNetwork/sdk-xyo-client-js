import type { EmptyObject } from '@xylabs/object'
import type { Payload, Query } from '@xyo-network/payload-model'

import type { PayloadDivinerPredicate } from './Predicate.ts'
import { PayloadDivinerSchema } from './Schema.ts'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject, O = number> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T, O>
>
export const isPayloadDivinerQueryPayload = <T extends EmptyObject = EmptyObject>(x?: Payload | null): x is PayloadDivinerQueryPayload<T> =>
  x?.schema === PayloadDivinerQuerySchema
