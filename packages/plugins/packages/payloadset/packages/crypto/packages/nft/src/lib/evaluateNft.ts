import { NftInfo } from '@xyo-network/crypto-wallet-nft-payload-plugin'

type RatingFunction = (nft: NftInfo) => boolean | Promise<boolean>

interface WeightedRating {
  criteria: RatingFunction
  weight: number
}

export const ratingCriteria: Record<string, WeightedRating> = {}

export const maxPossibleRating = Object.values(ratingCriteria).reduce((sum, { weight }) => sum + weight, 0)

export type Rating = {
  [key: keyof typeof ratingCriteria]: boolean
}

export const evaluateNft = async (
  /**
   * The NFT
   */
  nft: NftInfo,
): Promise<number> => {
  const score = (
    await Promise.all(
      Object.entries(ratingCriteria).map(([key, { criteria, weight }]) => {
        return [criteria(nft), weight] as const
      }),
    )
  ).reduce((sum, [passed, weight]) => (passed ? sum + weight : sum), 0)
  const rating = score / maxPossibleRating
  return rating
}
