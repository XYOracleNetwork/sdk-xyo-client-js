import { NftInfo, OpenSeaNftAttribute } from '@xyo-network/crypto-nft-payload-plugin'

import { BinomialDistributionParameters, calculateAllPropertiesDistribution, calculateBinomialParamsFromProbability } from './lib'

export interface NftTraitMetrics {
  binomial: Partial<BinomialDistributionParameters>
  count: number
}

export interface NftCollectionMetrics {
  metrics: {
    metadata: {
      attributes: {
        [trait: string]: {
          metrics: NftTraitMetrics
          values: {
            [value: string]: NftTraitMetrics
          }
        }
      }
    }
  }
}

type TraitDistributionEntry = [string, { [key: string]: number }]

export const getNftCollectionMetrics = (nfts: NftInfo[]): NftCollectionMetrics => {
  const traits = nfts
    .map((nft) => nft.metadata?.attributes as OpenSeaNftAttribute[])
    .map((attributes) => {
      return Object.fromEntries(attributes.map((attribute) => [attribute.trait_type, attribute.value]))
    })
  const distribution = calculateAllPropertiesDistribution(traits)
  const n = nfts.length
  const attributes = Object.fromEntries(
    Object.entries(distribution)
      .filter((v): v is TraitDistributionEntry => v[1] !== undefined)
      .map(([trait, entries]) => {
        const traitCount = Object.values(entries).reduce((prev, curr) => prev + curr, 0)
        const binomial = calculateBinomialParamsFromProbability(nfts.length, traitCount / n)
        const values = Object.fromEntries(
          Object.entries(entries).map(([value, traitValueCount]) => {
            const binomial = calculateBinomialParamsFromProbability(n, traitValueCount / n)
            const metrics: NftTraitMetrics = { binomial, count: traitValueCount }
            return [value, metrics]
          }),
        )
        return [trait, { metrics: { binomial, count: traitCount }, values }]
      }),
  )
  return { metrics: { metadata: { attributes } } }
}
