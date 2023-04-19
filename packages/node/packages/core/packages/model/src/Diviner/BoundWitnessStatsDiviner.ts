import { AbstractDiviner } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'
import { StatsPayload } from './StatsPayload'

export type BoundWitnessStatsSchema = 'network.xyo.diviner.boundwitness.stats'
export const BoundWitnessStatsSchema: BoundWitnessStatsSchema = 'network.xyo.diviner.boundwitness.stats'

export type BoundWitnessStatsQuerySchema = 'network.xyo.diviner.boundwitness.stats.query'
export const BoundWitnessStatsQuerySchema: BoundWitnessStatsQuerySchema = 'network.xyo.diviner.boundwitness.stats.query'

export type BoundWitnessStatsConfigSchema = 'network.xyo.diviner.boundwitness.stats.config'
export const BoundWitnessStatsConfigSchema: BoundWitnessStatsConfigSchema = 'network.xyo.diviner.boundwitness.stats.config'

export type BoundWitnessStatsDivinerConfig<
  S extends string = BoundWitnessStatsConfigSchema,
  T extends Payload = Payload,
> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type BoundWitnessStatsPayload = StatsPayload<{ schema: BoundWitnessStatsSchema }>
export const isBoundWitnessStatsPayload = (x?: Payload | null): x is BoundWitnessStatsPayload => x?.schema === BoundWitnessStatsSchema

export type BoundWitnessStatsQueryPayload = Query<{ schema: BoundWitnessStatsQuerySchema }>
export const isBoundWitnessStatsQueryPayload = (x?: Payload | null): x is BoundWitnessStatsQueryPayload => x?.schema === BoundWitnessStatsQuerySchema

export type BoundWitnessStatsDiviner = AbstractDiviner
