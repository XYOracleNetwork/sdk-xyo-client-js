import { AnyObject } from '@xyo-network/core'
import { Payload, Query } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './Predicate'
import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload<T extends AnyObject = AnyObject> = Query<{ schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate<T>>
export const isPayloadDivinerQueryPayload = <T extends AnyObject = AnyObject>(x?: Payload | null): x is PayloadDivinerQueryPayload<T> =>
  x?.schema === PayloadDivinerQuerySchema
