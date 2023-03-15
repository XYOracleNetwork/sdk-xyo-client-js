import { AbstractDiviner } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module-model'
import { XyoPayload } from '@xyo-network/payload-model'

import { XyoPayloadDivinerPredicate } from './XyoPayloadDivinerPredicate'

export type PayloadQuerySchema = 'network.xyo.diviner.payload.query'
export const PayloadQuerySchema: PayloadQuerySchema = 'network.xyo.diviner.payload.query'

export type PayloadConfigSchema = 'network.xyo.diviner.payload.config'
export const PayloadConfigSchema: PayloadConfigSchema = 'network.xyo.diviner.payload.config'

export type PayloadQueryPayload = XyoQuery<{ schema: PayloadQuerySchema } & XyoPayloadDivinerPredicate>
export const isPayloadQueryPayload = (x?: XyoPayload | null): x is PayloadQueryPayload => x?.schema === PayloadQuerySchema

export type PayloadDiviner = AbstractDiviner
