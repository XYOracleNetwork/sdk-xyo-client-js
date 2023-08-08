import { Payload } from '@xyo-network/payload-model'

import { NftCollectionMetadata } from '../Payload'
import { NftCollectionScoreSchema } from './Schema'

export type NftCollectionAnalysis = Record<string, [score: number, total: number]>

export interface NftCollectionScores {
  scores: Record<string, [score: number, total: number]>
}

export type NftCollectionScorePayload = Payload<NftCollectionMetadata & NftCollectionScores, NftCollectionScoreSchema>
export const isNftCollectionScorePayload = (x?: Payload | null): x is NftCollectionScorePayload => x?.schema === NftCollectionScoreSchema
