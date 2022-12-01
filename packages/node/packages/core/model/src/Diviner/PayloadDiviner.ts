import { AbstractDiviner } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

import { ArchiveQueryPayload } from './ArchiveQueryPayload'
import { XyoPayloadDivinerPredicate } from './XyoPayloadDivinerPredicate'

export type PayloadQuerySchema = 'network.xyo.diviner.payload.query'
export const PayloadQuerySchema: PayloadQuerySchema = 'network.xyo.diviner.payload.query'

export type PayloadConfigSchema = 'network.xyo.diviner.payload.config'
export const PayloadConfigSchema: PayloadConfigSchema = 'network.xyo.diviner.payload.config'

export type PayloadQueryPayload = ArchiveQueryPayload<{ schema: PayloadQuerySchema } & XyoPayloadDivinerPredicate>
export const isPayloadQueryPayload = (x?: XyoPayload | null): x is PayloadQueryPayload => x?.schema === PayloadQuerySchema

export type PayloadDiviner = AbstractDiviner
