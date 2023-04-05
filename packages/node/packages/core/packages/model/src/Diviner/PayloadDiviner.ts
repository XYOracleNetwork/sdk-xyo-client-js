import { AbstractDiviner } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { PayloadDivinerPredicate } from './PayloadDivinerPredicate'

export type PayloadQuerySchema = 'network.xyo.diviner.payload.query'
export const PayloadQuerySchema: PayloadQuerySchema = 'network.xyo.diviner.payload.query'

export type PayloadConfigSchema = 'network.xyo.diviner.payload.config'
export const PayloadConfigSchema: PayloadConfigSchema = 'network.xyo.diviner.payload.config'

export type PayloadQueryPayload = Query<{ schema: PayloadQuerySchema } & PayloadDivinerPredicate>
export const isPayloadQueryPayload = (x?: Payload | null): x is PayloadQueryPayload => x?.schema === PayloadQuerySchema

export type PayloadDiviner = AbstractDiviner
