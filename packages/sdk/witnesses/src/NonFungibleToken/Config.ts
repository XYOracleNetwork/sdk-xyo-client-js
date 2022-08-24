import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoExternalAddressSchema = 'network.xyo.address.external'
export const XyoExternalAddressSchema = 'network.xyo.address.external'

export type XyoExternalAddress = XyoPayload<{
  schema: XyoExternalAddressSchema
  chain: {
    platform: 'ethereum'
    network: string
  }
  address: string
}>

export type XyoNonFungibleTokenPayload<T extends EmptyObject = EmptyObject> = XyoPayload<{ schema: 'network.xyo.nft' } & T>

export type XyoContractTermPayload<T extends EmptyObject = EmptyObject> = XyoPayload<{ schema: 'network.xyo.contract.term' } & T>

export type XyoOwnerContractTermPayload = XyoContractTermPayload<{
  owner?: string
  read?: string | string[]
  write?: string | string[]
}>

export type XyoContractPayload<T extends EmptyObject = EmptyObject> = XyoPayload<
  { schema: 'network.xyo.contract' } & T & {
      terms?: string[]
    }
>

export type XyoNonFungibleTokenMintPayload = XyoContractPayload<{
  schema: 'network.xyo.nft.minter'
  name: string
  symbol: string
  /** @field array of XyoContractTermPayload hashes */
  terms?: string[]
  minters?: string[]
}>

export type XyoNonFungibleTokenMinterWitnessConfig = XyoWitnessConfig<{
  schema: 'network.xyo.nft.minter.query'
  mint: string
  mintToken?: XyoNonFungibleTokenPayload
  targetSchema: 'network.xyo.nft.minter'
}>

export type XyoNonFungibleTokenWitnessConfig = XyoWitnessConfig<
  XyoNonFungibleTokenPayload,
  {
    schema: 'network.xyo.nft.query'
    targetSchema: 'network.xyo.nft'
  }
>
