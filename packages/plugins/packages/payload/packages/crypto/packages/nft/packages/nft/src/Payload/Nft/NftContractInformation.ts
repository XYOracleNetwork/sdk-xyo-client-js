import { TokenType } from './TokenType'

export interface NftContractInformation {
  address: string
  chainId: number
  tokenType: TokenType
}
