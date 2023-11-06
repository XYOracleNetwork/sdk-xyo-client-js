import { NftContractInformation } from './NftContractInformation'
import { NftMetadata } from './NftMetadata'

export interface NftInfoFields extends NftContractInformation {
  metadata?: NftMetadata
  metadataUri?: string
  supply: string
  tokenId: string
}
