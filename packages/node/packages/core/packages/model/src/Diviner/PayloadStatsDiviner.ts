import { AbstractDiviner, DivinerConfig } from '@xyo-network/diviner'
import { XyoQuery } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { StatsPayload } from './StatsPayload'

export type PayloadStatsSchema = 'network.xyo.archivist.payload.stats'
export const PayloadStatsSchema: PayloadStatsSchema = 'network.xyo.archivist.payload.stats'

export type ArchivistPayloadStatsDivinerConfigSchema = 'network.xyo.archivist.payload.stats.config'
export const ArchivistPayloadStatsDivinerConfigSchema: ArchivistPayloadStatsDivinerConfigSchema = 'network.xyo.archivist.payload.stats.config'

export type ArchivistPayloadStatsDivinerConfig<S extends string = string, T extends Payload = Payload> = DivinerConfig<
  T & {
    schema: S
  }
>

export type PayloadStatsQuerySchema = 'network.xyo.archivist.payload.stats.query'
export const PayloadStatsQuerySchema: PayloadStatsQuerySchema = 'network.xyo.archivist.payload.stats.query'

export type PayloadStatsPayload = StatsPayload<{ schema: PayloadStatsSchema }>
export const isPayloadStatsPayload = (x?: Payload | null): x is PayloadStatsPayload => x?.schema === PayloadStatsSchema

export type PayloadStatsQueryPayload = XyoQuery<{ schema: PayloadStatsQuerySchema }>
export const isPayloadStatsQueryPayload = (x?: Payload | null): x is PayloadStatsQueryPayload => x?.schema === PayloadStatsQuerySchema

export type PayloadStatsDiviner = AbstractDiviner
