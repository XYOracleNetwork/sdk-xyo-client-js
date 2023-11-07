import { TokenType } from './TokenType'

export interface NftContractInformation {
  address: string
  chainId: number
  /** @deprecated use types instead */
  type?: TokenType
  types?: TokenType[]
}
