import { XyoPayload } from '@xyo-network/core'

export interface XyoExternalAddress extends XyoPayload {
  schema: 'network.xyo.external.address'
  chain: {
    platform: 'ethereum'
    network: string
  }
  address: string
}

export interface XyoNonFungibleTokenPayload extends XyoPayload {
  schema: 'network.xyo.nft'
}

export interface XyoContractTermPayload extends XyoPayload {
  schema: 'network.xyo.contract.term'
}

export interface XyoNonFungibleTokenMinterPayload extends XyoPayload {
  schema: 'network.xyo.nft.minter'
  name: string
  symbol: string
  /** @field owner address of the minter - can add/remove address allowed to mint or transfer ownership */
  owner: string
  /** @field array of XyoContractTermPayload hashes */
  terms?: string[]
}
