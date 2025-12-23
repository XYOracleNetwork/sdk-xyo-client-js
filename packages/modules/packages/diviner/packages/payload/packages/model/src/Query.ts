import type { EmptyObject } from '@xylabs/sdk-js'
import { AsObjectFactory } from '@xylabs/sdk-js'
import type { Query } from '@xyo-network/payload-model'
import { isPayloadOfSchemaType } from '@xyo-network/payload-model'

import type { PayloadDivinerPredicate } from './Predicate.ts'
import { PayloadDivinerSchema } from './Schema.ts'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends EmptyObject = EmptyObject> = Query<
  { schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>
>

export const isPayloadDivinerQueryPayload = isPayloadOfSchemaType<PayloadDivinerQueryPayload>(PayloadDivinerQuerySchema)

export const asPayloadDivinerQueryPayload = AsObjectFactory.create(isPayloadDivinerQueryPayload)
