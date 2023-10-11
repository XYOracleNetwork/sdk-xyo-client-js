import { Payload } from '@xyo-network/payload-model'

import { NftCollectionMetadata } from '../Payload'
import { NftCollectionScoreSchema } from './Schema'

export type NftCollectionAnalysis = Record<string, [score: number, total: number]>

export interface NftCollectionScores {
  scores: NftCollectionAnalysis
}

export type NftCollectionScoreFields = NftCollectionMetadata & NftCollectionScores & { sources?: string[] }

export type NftCollectionScore = Payload<NftCollectionScoreFields, NftCollectionScoreSchema>
export const isNftCollectionScore = (x?: Payload | null): x is NftCollectionScore => x?.schema === NftCollectionScoreSchema
