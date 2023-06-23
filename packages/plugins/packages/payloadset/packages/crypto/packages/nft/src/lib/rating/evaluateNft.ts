import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

export type PassFailScore = [amount: number, possible: 1]
export type ScaledScore = [amount: number, possible: number]
export type Score = ScaledScore | PassFailScore

export type PassFailRatingFunction = (nft: NftInfo) => PassFailScore | Promise<PassFailScore>
export type ScoreRatingFunction = (nft: NftInfo) => Score | Promise<Score>
export type RatingFunction = PassFailRatingFunction | ScoreRatingFunction

interface WeightedRating {
  criteria: RatingFunction
  weight: number
}

export const ratingCriteria: Record<string, WeightedRating> = {}
export const maxPossibleRating = Object.values(ratingCriteria).reduce((sum, { weight }) => sum + weight, 0)

export type Ratings = {
  [key: keyof typeof ratingCriteria]: Score
}

export const evaluateNft = async (
  /**
   * The NFT
   */
  nft: NftInfo,
): Promise<Ratings> => {
  return Object.fromEntries(
    await Promise.all(
      Object.entries(ratingCriteria).map(async ([key, { criteria, weight }]) => {
        const score = await criteria(nft)
        const weighted = score.map((v) => v * weight) as Score
        return [key, weighted] as const
      }),
    ),
  )
}
