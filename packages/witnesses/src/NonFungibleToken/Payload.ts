import { XyoPayload, XyoQueryPayload } from '@xyo-network/payload'

export interface XyoExternalAddress extends XyoPayload {
  chain: {
    platform: 'ethereum'
    network: string
  }
  address: string
}

export type XyoNonFungibleTokenPayload = XyoPayload

export type XyoContractTermPayload = XyoPayload

export interface XyoOwnerContractTermPayload extends XyoContractTermPayload {
  owner?: string
  read?: string | string[]
  write?: string | string[]
}

export interface XyoContractPayload extends XyoPayload {
  terms?: string[]
}

export interface XyoNonFungibleTokenMintPayload extends XyoContractPayload {
  schema: 'network.xyo.nft.minter'
  name: string
  symbol: string
  /** @field array of XyoContractTermPayload hashes */
  terms?: string[]
  minters?: string[]
}

export interface XyoNonFungibleTokenMintQueryPayload extends XyoQueryPayload {
  schema: 'network.xyo.nft.minter.query'
  mint: string
  mintToken?: XyoNonFungibleTokenPayload
}
