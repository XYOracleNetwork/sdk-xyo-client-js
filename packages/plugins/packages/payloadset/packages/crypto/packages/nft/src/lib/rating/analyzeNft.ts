import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { scoringCriteria } from './criteria'
import { Score } from './score'

type ScoringCriteriaKey = keyof typeof scoringCriteria & PropertyKey

export type NftAnalysis = {
  [key in ScoringCriteriaKey]: Score
}

export const analyzeNft = async (
  /**
   * The NFT to evaluate
   */
  nft: NftInfo,
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
