import { Payload } from '@xyo-network/payload-model'

import { NftScoreSchema } from './Schema'

export type PassFailScore = [total: number, possible: 1]
export const PASS: PassFailScore = [1, 1]
export const FAIL: PassFailScore = [0, 1]
export type ScaledScore = [total: number, possible: number]
export const SKIP: ScaledScore = [0, 0]
export type Score = ScaledScore | PassFailScore

const attributesScoringCriteria = {
  Attributes: true,
}

const metadataScoringCriteria = {
  'Animation URL': true,
  'Background Color': true,
  Description: true,
  'External Url': true,
  Image: true,
  'Image Data': true,
  Name: true,
  'YouTube URL': true,
  ...attributesScoringCriteria,
}

export const scoringCriteria = {
  'Contract Address': true,
  Supply: true,
  'Token Id': true,
  Type: true,
  ...metadataScoringCriteria,
}

type ScoringCriteriaKey = keyof typeof scoringCriteria & PropertyKey

export type NftAnalysis = {
  [key in ScoringCriteriaKey]: Score
}

export type NftScorePayload = Payload<{ schema: NftScoreSchema } & Partial<Omit<NftAnalysis, 'schema'>>>
