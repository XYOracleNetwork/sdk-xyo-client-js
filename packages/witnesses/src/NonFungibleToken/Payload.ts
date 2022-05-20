import { XyoPayload } from '@xyo-network/core'

export interface XyoSmartContract {
  chain: {
    platform: 'ethereum'
    network: string
  }
  address: string
}

export interface XyoNonFungibleTokenPayload extends XyoPayload {
  contract?: string
}
