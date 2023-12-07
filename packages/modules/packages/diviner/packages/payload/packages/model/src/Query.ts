import { EmptyObject } from '@xyo-network/object'
import { Payload, Query } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './Predicate'
import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>
>
export const isPayloadDivinerQueryPayload = <T extends EmptyObject = EmptyObject>(x?: Payload | null): x is PayloadDivinerQueryPayload<T> =>
  x?.schema === PayloadDivinerQuerySchema
