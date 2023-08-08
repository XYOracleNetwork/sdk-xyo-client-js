import { Score } from '@xyo-network/crypto-nft-score-model'
import { Payload } from '@xyo-network/payload-model'

import { NftContractInformation } from '../Payload'
import { NftScoreSchema } from './Schema'

export type AttributesScoringCriteria = 'Attributes'

export type MetadataScoringCriteria =
  | 'Animation URL'
  | 'Background Color'
  | 'Description'
  | 'External Url'
  | 'Image'
  | 'Image Data'
  | 'Name'
  | 'YouTube URL'
  | AttributesScoringCriteria

export type ScoringCriteria = 'Contract Address' | 'Supply' | 'Token Id' | 'Type' | MetadataScoringCriteria

export type ScoringCriteriaKey = ScoringCriteria & PropertyKey

export type NftAnalysis = {
  [key in ScoringCriteriaKey]: Score
}

export interface NftScores {
  scores: NftAnalysis
}

export type NftScoreFields = NftContractInformation & NftScores

export type NftScore = Payload<NftScoreFields, NftScoreSchema>
export const isNftScore = (x?: Payload | null): x is NftScore => x?.schema === NftScoreSchema
