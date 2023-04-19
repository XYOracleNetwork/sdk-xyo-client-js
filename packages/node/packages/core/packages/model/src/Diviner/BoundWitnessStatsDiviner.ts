import { AbstractDiviner } from '@xyo-network/diviner'
import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { ArchivistPayloadStatsDivinerConfig } from './PayloadStatsDiviner'
import { StatsPayload } from './StatsPayload'

export type BoundWitnessStatsDivinerSchema = 'network.xyo.diviner.boundwitness.stats'
export const BoundWitnessStatsDivinerSchema: BoundWitnessStatsDivinerSchema = 'network.xyo.diviner.boundwitness.stats'

export type BoundWitnessStatsDivinerQuerySchema = 'network.xyo.diviner.boundwitness.stats.query'
export const BoundWitnessStatsDivinerQuerySchema: BoundWitnessStatsDivinerQuerySchema = 'network.xyo.diviner.boundwitness.stats.query'

export type BoundWitnessStatsDivinerConfigSchema = 'network.xyo.diviner.boundwitness.stats.config'
export const BoundWitnessStatsDivinerConfigSchema: BoundWitnessStatsDivinerConfigSchema = 'network.xyo.diviner.boundwitness.stats.config'

export type BoundWitnessStatsDivinerConfig<
  S extends string = BoundWitnessStatsDivinerConfigSchema,
  T extends Payload = Payload,
> = ArchivistPayloadStatsDivinerConfig<
  S,
  T & {
    schema: S
  }
>

export type BoundWitnessStatsDivinerPayload = StatsPayload<{ schema: BoundWitnessStatsDivinerSchema }>
export const isBoundWitnessStatsDivinerPayload = (x?: Payload | null): x is BoundWitnessStatsDivinerPayload =>
  x?.schema === BoundWitnessStatsDivinerSchema

export type BoundWitnessStatsDivinerQueryPayload = Query<{ schema: BoundWitnessStatsDivinerQuerySchema }>
export const isBoundWitnessStatsDivinerQueryPayload = (x?: Payload | null): x is BoundWitnessStatsDivinerQueryPayload =>
  x?.schema === BoundWitnessStatsDivinerQuerySchema

export type BoundWitnessStatsDiviner = AbstractDiviner
