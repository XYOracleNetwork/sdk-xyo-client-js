import { NftTraitMetrics } from './NftTraitMetrics'

export interface NftCollectionMetrics {
  metadata: {
    attributes: {
      [trait: string]: {
        metrics: NftTraitMetrics
        values: {
          [traitValue: string]: NftTraitMetrics
        }
      }
    }
  }
}
