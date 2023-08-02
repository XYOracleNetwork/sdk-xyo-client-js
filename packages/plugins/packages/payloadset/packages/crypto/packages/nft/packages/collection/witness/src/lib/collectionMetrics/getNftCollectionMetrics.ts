import { NftInfo, OpenSeaNftAttribute } from '@xyo-network/crypto-nft-payload-plugin'

import { calculateAllPropertiesDistribution, Distribution } from './lib'

export interface NftCollectionMetrics {
  distribution: {
    metadata: {
      attributes: Distribution<{
        [key: string]: string | number
      }>
    }
  }
}

export const getNftCollectionMetrics = (nfts: NftInfo[]): NftCollectionMetrics => {
  const attributes = nfts
    .map((nft) => nft.metadata?.attributes as OpenSeaNftAttribute[])
    .map((attributes) => {
      return Object.fromEntries(attributes.map((attribute) => [attribute.trait_type, attribute.value]))
    })
  const distribution = calculateAllPropertiesDistribution(attributes)
  return {
    distribution: {
      metadata: {
        attributes: distribution,
      },
    },
  }
}
