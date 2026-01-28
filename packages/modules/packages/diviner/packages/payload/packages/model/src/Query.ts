import type { EmptyObject } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import type { Query } from '@xyo-network/payload-model'
import { asSchema, isPayloadOfSchemaType } from '@xyo-network/payload-model'

import type { PayloadDivinerPredicate } from './Predicate.ts'
import { PayloadDivinerSchema } from './Schema.ts'

export const PayloadDivinerQuerySchema = asSchema(`${PayloadDivinerSchema}.query`, true)
export type PayloadDivinerQuerySchema = typeof PayloadDivinerQuerySchema

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>
>

export const isPayloadDivinerQueryPayload = isPayloadOfSchemaType<PayloadDivinerQueryPayload>(PayloadDivinerQuerySchema)

export const asPayloadDivinerQueryPayload = AsObjectFactory.create(isPayloadDivinerQueryPayload)
