import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './PayloadDivinerPredicate'
import { PayloadDivinerSchema } from './Schema'

export type PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = `${PayloadDivinerSchema}.query`

export type PayloadDivinerQueryPayload = Query<{ schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate>
export const isPayloadDivinerQueryPayload = (x?: Payload | null): x is PayloadDivinerQueryPayload => x?.schema === PayloadDivinerQuerySchema
