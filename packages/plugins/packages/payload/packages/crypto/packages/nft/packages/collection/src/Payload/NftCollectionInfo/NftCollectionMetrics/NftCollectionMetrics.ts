import { NftTraitMetrics } from './NftTraitMetrics'

export type NftCollectionMetrics = {
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
