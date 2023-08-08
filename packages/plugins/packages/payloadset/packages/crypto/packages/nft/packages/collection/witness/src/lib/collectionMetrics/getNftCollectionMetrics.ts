import { NftCollectionMetrics, NftTraitMetrics } from '@xyo-network/crypto-nft-collection-payload-plugin'
import { NftInfo, OpenSeaNftAttribute } from '@xyo-network/crypto-nft-payload-plugin'

import { calculateAllPropertiesDistribution, calculateBinomialParamsFromProbability } from './lib'

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
        const { p } = calculateBinomialParamsFromProbability(nfts.length, traitCount / n)
        const values = Object.fromEntries(
          Object.entries(entries).map(([value, traitValueCount]) => {
            const { p } = calculateBinomialParamsFromProbability(n, traitValueCount / n)
            const metrics: NftTraitMetrics = { binomial: { p }, count: traitValueCount }
            return [value, metrics]
          }),
        )
        return [trait, { metrics: { binomial: { p }, count: traitCount }, values }]
      }),
  )
  return { metadata: { attributes } }
}
