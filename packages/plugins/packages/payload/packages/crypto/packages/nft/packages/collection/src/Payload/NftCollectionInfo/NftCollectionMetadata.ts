import { NftContractInformation } from '@xyo-network/crypto-nft-payload-plugin'

export interface NftCollectionMetadata extends NftContractInformation {
  name: string
  symbol: string
}
