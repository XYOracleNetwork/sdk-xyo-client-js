import { Payload, Query } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './Predicate'
import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload = Query<{ schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate>
export const isPayloadDivinerQueryPayload = (x?: Payload | null): x is PayloadDivinerQueryPayload => x?.schema === PayloadDivinerQuerySchema
