import { BinomialDistributionParameters } from './BinomialDistributionParameters'

export interface NftTraitMetrics {
  binomial: Pick<BinomialDistributionParameters, 'p'>
  count: number
}
