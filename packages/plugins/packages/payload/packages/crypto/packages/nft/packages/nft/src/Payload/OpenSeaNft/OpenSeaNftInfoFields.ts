import { NftInfoFields } from '../Payload'
import { OpenSeaNftMetadata } from './OpenSeaNftMetadata'

export interface OpenSeaNftInfoFields extends NftInfoFields {
  metadata: OpenSeaNftMetadata
}
