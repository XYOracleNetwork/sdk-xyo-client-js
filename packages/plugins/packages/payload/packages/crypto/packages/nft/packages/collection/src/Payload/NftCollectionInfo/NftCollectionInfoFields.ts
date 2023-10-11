import { NftCollectionAttributeMetrics } from './NftCollectionAttributeMetrics'
import { NftCollectionCount } from './NftCollectionCount'
import { NftCollectionMetadata } from './NftCollectionMetadata'

export type NftCollectionInfoFields = NftCollectionCount &
  NftCollectionMetadata &
  NftCollectionAttributeMetrics & {
    sources?: string[]
  }
