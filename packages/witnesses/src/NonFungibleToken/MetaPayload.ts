import { XyoPayload } from '@xyo-network/core'

/* https://github.com/ethereum/EIPs/blob/master/EIPS/eip-721.md */
export interface Erc721Meta {
  name?: string
  description?: string
  image?: string
}

/* https://docs.opensea.io/docs/metadata-standards */
export interface OpenSeaAttribute {
  trait_type?: string
  display_type?: 'date' | string
  value?: string | number | boolean
}

/* https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema */
export interface Eip1155Property {
  trait_type?: string
  display_type?: 'date' | string
  value?: string | number | boolean
}

/* https://docs.opensea.io/docs/metadata-standards */
export interface OpenSeaMeta extends XyoPayload, Erc721Meta {
  image_data?: string
  external_url?: string
  attributes?: OpenSeaAttribute[]
  background_color?: string
  animation_url?: string
  youtube_url?: string
  /** @field EIP1155 Compatible properties */
  properties?: Eip1155Property[]
}

export interface XyoNonFungibleTokenMetaPayload extends XyoPayload, Erc721Meta, OpenSeaMeta {
  /** @field The token that this meta data applies to */
  token: string
}
