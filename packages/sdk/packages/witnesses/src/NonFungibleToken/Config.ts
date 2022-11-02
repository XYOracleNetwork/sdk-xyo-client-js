import { EmptyObject } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'
import { XyoWitnessConfig } from '@xyo-network/witness'

export type XyoExternalAddressSchema = 'network.xyo.address.external'
export const XyoExternalAddressSchema = 'network.xyo.address.external'

export type XyoExternalAddress = XyoPayload<{
  address: string
  chain: {
    network: string
    platform: 'ethereum'
  }
  schema: XyoExternalAddressSchema
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
  minters?: string[]
  name: string
  schema: 'network.xyo.nft.minter'
  symbol: string
  /** @field array of XyoContractTermPayload hashes */
  terms?: string[]
}>

export type XyoNonFungibleTokenMinterWitnessConfig = XyoWitnessConfig<
  XyoNonFungibleTokenPayload,
  {
    mint: string
    mintToken?: XyoNonFungibleTokenPayload
    schema: 'network.xyo.nft.minter.query'
  }
>

export type XyoNonFungibleTokenWitnessConfig = XyoWitnessConfig<XyoNonFungibleTokenPayload>
