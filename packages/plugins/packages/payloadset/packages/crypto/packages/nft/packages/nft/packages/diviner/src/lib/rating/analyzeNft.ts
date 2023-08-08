import { NftInfoFields } from '@xyo-network/crypto-nft-payload-plugin'
import { Score } from '@xyo-network/crypto-nft-score-model'

import { scoringCriteria } from './criteria'

export type ScoringCriteriaKey = keyof typeof scoringCriteria & PropertyKey

export type NftAnalysis = {
  [key in ScoringCriteriaKey]: Score
}

export const analyzeNft = async (
  /**
   * The NFT to evaluate
   */
  nft: NftInfoFields,
): Promise<NftAnalysis> => {
  const result = Object.fromEntries(
    await Promise.all(
      Object.entries(scoringCriteria).map(async ([key, { score, weight }]) => {
        const rawScore = await score(nft)
        const weighted = rawScore.map((v) => v * weight) as Score
        return [key, weighted] as const
      }),
    ),
  ) as NftAnalysis
  return result
}
