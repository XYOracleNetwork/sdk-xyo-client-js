import { NftContractInformation } from './NftContractInformation'
import { NftMetadata } from './NftMetadata'

export interface NftInfoFields extends NftContractInformation {
  metaDataUri?: string
  metadata?: NftMetadata
  supply: string
  tokenId: string
}
