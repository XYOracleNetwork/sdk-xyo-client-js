import { NftInfoFields } from '../Nft'
import { OpenSeaNftMetadata } from './OpenSeaNftMetadata'

export interface OpenSeaNftInfoFields extends NftInfoFields {
  metadata: OpenSeaNftMetadata
}
