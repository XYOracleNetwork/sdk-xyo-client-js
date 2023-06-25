import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

import { scoringCriteria } from './criteria'
import { Score } from './score'

export type Ratings = {
  [key: keyof typeof scoringCriteria]: Score
}

export const evaluateNft = async (
  /**
   * The NFT
   */
  nft: NftInfo,
): Promise<Ratings> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(scoringCriteria).map(async ([key, { score, weight }]) => {
        const rawScore = await score(nft)
        const weighted = rawScore.map((v) => v * weight) as Score
        return [key, weighted] as const
      }),
    ),
  )
}
