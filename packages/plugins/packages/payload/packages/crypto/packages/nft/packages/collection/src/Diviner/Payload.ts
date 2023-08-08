import { Payload } from '@xyo-network/payload-model'

import { NftCollectionMetadataInfo } from '../Payload'
import { NftCollectionScoreSchema } from './Schema'

export type NftCollectionAnalysis = Record<string, [score: number, total: number]>

export interface Scores {
  scores: Record<string, [score: number, total: number]>
}

export type NftCollectionScorePayload = Payload<NftCollectionMetadataInfo & Scores, NftCollectionScoreSchema>
export const isNftCollectionScorePayload = (x?: Payload | null): x is NftCollectionScorePayload => x?.schema === NftCollectionScoreSchema
