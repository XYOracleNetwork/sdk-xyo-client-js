import { Query } from '@xyo-network/module-model'
import { Payload } from '@xyo-network/payload-model'

import { BoundWitnessStatsDivinerSchema } from './Schema'

export type BoundWitnessStatsDivinerQuerySchema = `${BoundWitnessStatsDivinerSchema}.query`
export const BoundWitnessStatsDivinerQuerySchema: BoundWitnessStatsDivinerQuerySchema = `${BoundWitnessStatsDivinerSchema}.query`

export type BoundWitnessStatsDivinerQueryPayload = Query<{ schema: BoundWitnessStatsDivinerQuerySchema }>
export const isBoundWitnessStatsDivinerQueryPayload = (x?: Payload | null): x is BoundWitnessStatsDivinerQueryPayload =>
  x?.schema === BoundWitnessStatsDivinerQuerySchema
