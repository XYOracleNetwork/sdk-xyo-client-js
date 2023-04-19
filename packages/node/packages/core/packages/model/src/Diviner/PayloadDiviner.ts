import { AbstractDiviner } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './PayloadDivinerPredicate'

export type PayloadDivinerQuerySchema = 'network.xyo.diviner.payload.query'
export const PayloadDivinerQuerySchema: PayloadDivinerQuerySchema = 'network.xyo.diviner.payload.query'

export type PayloadDivinerConfigSchema = 'network.xyo.diviner.payload.config'
export const PayloadDivinerConfigSchema: PayloadDivinerConfigSchema = 'network.xyo.diviner.payload.config'

export type PayloadDivinerQueryPayload = Query<{ schema: PayloadDivinerQuerySchema } & PayloadDivinerPredicate>
export const isPayloadDivinerQueryPayload = (x?: Payload | null): x is PayloadDivinerQueryPayload => x?.schema === PayloadDivinerQuerySchema

export type PayloadDiviner = AbstractDiviner
