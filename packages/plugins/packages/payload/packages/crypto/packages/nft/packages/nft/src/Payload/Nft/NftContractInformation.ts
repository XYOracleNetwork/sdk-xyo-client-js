import { TokenType } from './TokenType'

export interface NftContractInformation {
  address: string
  chainId: number
  implementation?: string
  /** @deprecated use types instead */
  type?: TokenType
  types?: TokenType[]
}
