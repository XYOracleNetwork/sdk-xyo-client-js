import { AsObjectFactory, EmptyObject } from '@xylabs/object'
import { isPayloadOfSchemaType, Query } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './Predicate.ts'
import { PayloadDivinerSchema } from './Schema.ts'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>
>

export const isPayloadDivinerQueryPayload = isPayloadOfSchemaType<PayloadDivinerQueryPayload>(PayloadDivinerQuerySchema)

export const asPayloadDivinerQueryPayload = AsObjectFactory.create(isPayloadDivinerQueryPayload)
