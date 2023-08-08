import { NftTraitMetrics } from './NftTraitMetrics'

export interface NftCollectionMetrics {
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
