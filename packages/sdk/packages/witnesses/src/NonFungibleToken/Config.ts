import { AnyObject } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { WitnessConfig } from '@xyo-network/witness-model'

export type ExternalAddressSchema = 'network.xyo.address.external'
export const ExternalAddressSchema = 'network.xyo.address.external'

export type ExternalAddress = Payload<{
  address: string
  chain: {
    network: string
    platform: 'ethereum'
  }
  schema: ExternalAddressSchema
}>

export type NonFungibleTokenPayload<T extends AnyObject = AnyObject> = Payload<{ schema: 'network.xyo.nft' } & T>

export type ContractTermPayload<T extends AnyObject = AnyObject> = Payload<{ schema: 'network.xyo.contract.term' } & T>

export type OwnerContractTermPayload = ContractTermPayload<{
  owner?: string
  read?: string | string[]
  write?: string | string[]
}>

export type ContractPayload<T extends AnyObject = AnyObject> = Payload<
  { schema: 'network.xyo.contract' } & T & {
      terms?: string[]
    }
>

export type NonFungibleTokenMintPayload = ContractPayload<{
  minters?: string[]
  name: string
  schema: 'network.xyo.nft.minter'
  symbol: string
  /** @field array of ContractTermPayload hashes */
  terms?: string[]
}>

export type NonFungibleTokenMinterWitnessConfig = WitnessConfig<{
  mint: string
  mintToken?: NonFungibleTokenPayload
  schema: 'network.xyo.nft.minter.query'
}>

export type NonFungibleTokenWitnessConfig = WitnessConfig<NonFungibleTokenPayload>
