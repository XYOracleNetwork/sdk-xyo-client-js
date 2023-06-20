import { Payload } from '@xyo-network/payload-model'

import { CryptoWalletNftSchema } from './Schema'


export interface NftInfo {
  contract: string,
  tokenType: string,
  name: string,
  symbol: string
}

export type CryptoWalletNftPayload = Payload<{
  address: string
  nfts: NftInfo[]
  schema: CryptoWalletNftSchema
  timestamp: number
}>
