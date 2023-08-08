import { NftMetadata } from './NftMetadata'

/**
 * @deprecated Use NftContractInformation instead
 */
export interface TempNftContractInformation {
  chainId: number
  contract: string
  type: string | null
}

export interface NftInfoFields extends TempNftContractInformation {
  metadata?: NftMetadata
  supply: string
  tokenId: string
}
