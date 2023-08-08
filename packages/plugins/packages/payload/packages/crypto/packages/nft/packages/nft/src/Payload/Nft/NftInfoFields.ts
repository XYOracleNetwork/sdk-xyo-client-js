import { NftMetadata } from './NftMetadata'

export interface NftInfoFields {
  chainId: number
  // TODO: Change to address
  contract: string
  metadata?: NftMetadata
  supply: string
  tokenId: string
  // TODO: Change to tokenType
  // TODO: 'ERC721' | 'ERC1155' |null
  type: string | null
}
