import { WeightedScoringCriteria } from '../score'
import {
  scoreAnimationUrl,
  scoreBackgroundColor,
  scoreContractAddress,
  scoreDescription,
  scoreExternalUrl,
  scoreImage,
  scoreImageData,
  scoreName,
  scoreSupply,
  scoreTokenId,
  scoreType,
  scoreYoutubeUrl,
} from './scoring'

const attributesScoringCriteria: Record<string, WeightedScoringCriteria> = {}

const metadataScoringCriteria: Record<string, WeightedScoringCriteria> = {
  'Animation URL': { score: scoreAnimationUrl, weight: 1 },
  'Background Color': { score: scoreBackgroundColor, weight: 1 },
  Description: { score: scoreDescription, weight: 1 },
  'External Url': { score: scoreExternalUrl, weight: 1 },
  Image: { score: scoreImage, weight: 1 },
  'Image Data': { score: scoreImageData, weight: 1 },
  Name: { score: scoreName, weight: 1 },
  'YouTube URL': { score: scoreYoutubeUrl, weight: 1 },
  ...attributesScoringCriteria,
}

export const scoringCriteria: Record<string, WeightedScoringCriteria> = {
  'Contract Address': { score: scoreContractAddress, weight: 1 },
  Supply: { score: scoreSupply, weight: 1 },
  'Token Id': { score: scoreTokenId, weight: 1 },
  Type: { score: scoreType, weight: 1 },
  ...metadataScoringCriteria,
}
