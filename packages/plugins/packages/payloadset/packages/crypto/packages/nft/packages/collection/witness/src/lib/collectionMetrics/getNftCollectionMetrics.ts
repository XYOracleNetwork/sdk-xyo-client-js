import { NftInfo, OpenSeaNftAttribute } from '@xyo-network/crypto-nft-payload-plugin'

import { BinomialDistributionParameters, calculateAllPropertiesDistribution } from './lib'

export type Foo = { [key: string]: NftTraitMetrics }

export interface NftTraitMetrics {
  binomial: Partial<BinomialDistributionParameters>
  count: number
}

export interface NftCollectionMetrics {
  metrics: {
    metadata: {
      attributes: {
        [trait: string]: {
          [value: string]: NftTraitMetrics
        }
      }
    }
  }
}

export const getNftCollectionMetrics = (nfts: NftInfo[]): NftCollectionMetrics => {
  const traits = nfts
    .map((nft) => nft.metadata?.attributes as OpenSeaNftAttribute[])
    .map((attributes) => {
      return Object.fromEntries(attributes.map((attribute) => [attribute.trait_type, attribute.value]))
    })
  const distribution = calculateAllPropertiesDistribution(traits)
  const attributes: { [trait: string]: { [value: string]: NftTraitMetrics } } = Object.fromEntries(
    Object.entries(distribution)
      .filter((v): v is [string, { [key: string]: number }] => {
        return v[1] !== undefined
      })
      .map(([trait, value]) => {
        const values = Object.fromEntries(
          Object.entries(value).map(([value, count]) => {
            const binomial = {
              p: count / nfts.length,
            }
            const metrics: NftTraitMetrics = { binomial, count }
            return [value, metrics]
          }),
        )
        return [trait, { ...values }]
      }),
  )
  return { metrics: { metadata: { attributes } } }
}
