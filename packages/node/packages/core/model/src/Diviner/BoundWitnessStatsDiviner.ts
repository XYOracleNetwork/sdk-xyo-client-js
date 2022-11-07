import { XyoDiviner } from '@xyo-network/diviner'
import { XyoPayload } from '@xyo-network/payload'

import { ArchiveQueryPayload } from './ArchiveQueryPayload'
import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'
import { StatsPayload } from './StatsPayload'

export type BoundWitnessStatsSchema = 'network.xyo.archivist.boundwitness.stats'
export const BoundWitnessStatsSchema: BoundWitnessStatsSchema = 'network.xyo.archivist.boundwitness.stats'

export type BoundWitnessStatsQuerySchema = 'network.xyo.archivist.boundwitness.stats.query'
export const BoundWitnessStatsQuerySchema: BoundWitnessStatsQuerySchema = 'network.xyo.archivist.boundwitness.stats.query'

export type BoundWitnessStatsConfigSchema = 'network.xyo.archivist.boundwitness.stats.config'
export const BoundWitnessStatsConfigSchema: BoundWitnessStatsConfigSchema = 'network.xyo.archivist.boundwitness.stats.config'

export type BoundWitnessStatsDivinerConfig<
  S extends string = BoundWitnessStatsConfigSchema,
  T extends XyoPayload = XyoPayload,
> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type BoundWitnessStatsPayload = StatsPayload<{ schema: BoundWitnessStatsSchema }>
export const isBoundWitnessStatsPayload = (x?: XyoPayload | null): x is BoundWitnessStatsPayload => x?.schema === BoundWitnessStatsSchema

export type BoundWitnessStatsQueryPayload = ArchiveQueryPayload<{ schema: BoundWitnessStatsQuerySchema }>
export const isBoundWitnessStatsQueryPayload = (x?: XyoPayload | null): x is BoundWitnessStatsQueryPayload =>
  x?.schema === BoundWitnessStatsQuerySchema

export type BoundWitnessStatsDiviner = XyoDiviner
