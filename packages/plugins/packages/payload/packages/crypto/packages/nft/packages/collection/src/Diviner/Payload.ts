import { Payload } from '@xyo-network/payload-model'

import { NftScoreSchema } from './Schema'

export type PassFailScore = [total: number, possible: 1]
export const PASS: PassFailScore = [1, 1]
export const FAIL: PassFailScore = [0, 1]
export type ScaledScore = [total: number, possible: number]
export const SKIP: ScaledScore = [0, 0]
export type Score = ScaledScore | PassFailScore

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

export type NftScorePayload = Payload<{ schema: NftScoreSchema } & Partial<Omit<NftAnalysis, 'schema'>>>
export const isNftScorePayload = (x?: Payload | null): x is NftScorePayload => x?.schema === NftScoreSchema
