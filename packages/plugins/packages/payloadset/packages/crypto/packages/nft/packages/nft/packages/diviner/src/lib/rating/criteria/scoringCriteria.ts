import {
  evaluateNftAttributes,
  scoreContractAddress,
  scoreNftAnimationUrl,
  scoreNftBackgroundColor,
  scoreNftDescription,
  scoreNftExternalUrl,
  scoreNftImage,
  scoreNftImageData,
  scoreNftName,
  scoreNftYoutubeUrl,
  scoreSupply,
  scoreTokenId,
  scoreType,
} from './scoring'

const attributesScoringCriteria = {
  Attributes: { score: evaluateNftAttributes, weight: 1 },
}

const metadataScoringCriteria = {
  'Animation URL': { score: scoreNftAnimationUrl, weight: 1 },
  'Background Color': { score: scoreNftBackgroundColor, weight: 1 },
  Description: { score: scoreNftDescription, weight: 1 },
  'External Url': { score: scoreNftExternalUrl, weight: 1 },
  Image: { score: scoreNftImage, weight: 1 },
  'Image Data': { score: scoreNftImageData, weight: 1 },
  Name: { score: scoreNftName, weight: 1 },
  'YouTube URL': { score: scoreNftYoutubeUrl, weight: 1 },
  ...attributesScoringCriteria,
}

export const scoringCriteria = {
  'Contract Address': { score: scoreContractAddress, weight: 1 },
  Supply: { score: scoreSupply, weight: 1 },
  'Token Id': { score: scoreTokenId, weight: 1 },
  Type: { score: scoreType, weight: 1 },
  ...metadataScoringCriteria,
}
