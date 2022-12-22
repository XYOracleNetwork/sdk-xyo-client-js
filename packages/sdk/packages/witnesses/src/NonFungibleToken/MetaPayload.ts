import { XyoPayload } from '@xyo-network/payload-model'

/* https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md */
export interface Erc721Meta {
  description?: string
  image?: string
  name?: string
}

/* https://docs.opensea.io/docs/metadata-standards */
export interface OpenSeaAttribute {
  display_type?: 'date' | string
  trait_type?: string
  value?: string | number | boolean
}

/* https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema */
export interface Eip1155Property {
  display_type?: 'date' | string
  trait_type?: string
  value?: string | number | boolean
}

/* https://docs.opensea.io/docs/metadata-standards */
export interface OpenSeaMeta extends XyoPayload, Erc721Meta {
  animation_url?: string
  attributes?: OpenSeaAttribute[]
  background_color?: string
  external_url?: string
  image_data?: string
  /** @field EIP1155 Compatible properties */
  properties?: Eip1155Property[]
  youtube_url?: string
}

export interface XyoNonFungibleTokenMetaPayload extends XyoPayload, Erc721Meta, OpenSeaMeta {
  /** @field The token that this meta data applies to */
  address: string
}
