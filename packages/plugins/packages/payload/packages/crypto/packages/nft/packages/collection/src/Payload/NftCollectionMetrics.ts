import { NftTraitMetrics } from './NftTraitMetrics'

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
