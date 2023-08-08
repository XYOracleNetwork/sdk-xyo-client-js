import { TokenType } from './TokenType'

export interface NftEvmCompatibleFields {
  address: string
  chainId: number
  tokenType: TokenType
}
