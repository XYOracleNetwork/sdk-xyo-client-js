import { NftContractInformation } from './NftContractInformation'
import { NftMetadata } from './NftMetadata'

export type NftInfoFields = NftContractInformation & {
  metadata?: NftMetadata
  supply: string
  tokenId: string
}
