import { Payload } from '@xyo-network/payload-model'

import { NftSchema } from './Schema'

export interface NftAttribute {
  [key: string]: unknown
  display_type?: unknown
  trait_type?: unknown
  value?: unknown
}
export interface NftMetadata {
  [key: string]: unknown
  attributes?: NftAttribute[] | unknown
  description?: unknown
  image?: unknown
  name?: unknown
}

export interface NftInfo {
  contract: string
  metadata?: NftMetadata
  supply: string
  tokenId: string
  type: string
}

export interface OpenSeaNftAttribute {
  [key: string]: unknown
  display_type?: 'date' | 'boost_number' | 'boost_percentage' | 'number'
  max_value?: number
  trait_type?: string
  value?: string | number
}

/**
 * https://docs.opensea.io/docs/metadata-standards
 */
export interface OpenSeaNftMetadata {
  [key: string]: unknown
  /**
   * A URL to a multi-media attachment for the item. The file extensions GLTF, GLB, WEBM, MP4, M4V, OGV, and OGG are supported, along with the audio-only extensions MP3, WAV, and OGA. Animation_url also supports HTML pages, allowing you to build rich experiences and interactive NFTs using JavaScript canvas, WebGL, and more. Scripts and relative paths within the HTML page are now supported. However, access to browser extensions is not supported.
   */
  animation_url: string
  /**
   * These are the attributes for the item, which will show up on the OpenSea page for the item.
   */
  attributes?: OpenSeaNftAttribute[]
  /**
   * Background color of the item on OpenSea. Must be a six-character hexadecimal without a pre-pended #.
   */
  background_color: string
  /**
   * A human readable description of the item. Markdown is supported.
   */
  description: string
  /**
   * This is the URL that will appear below the asset's image on OpenSea and will allow users to leave OpenSea and view the item on your site.
   */
  external_url: string
  /**
   * This is the URL to the image of the item. Can be just about any type of image (including SVGs, which will be cached into PNGs by OpenSea), and can be IPFS URLs or paths. We recommend using a 350 x 350 image.
   */
  image: string
  /**
   * Raw SVG image data, if you want to generate images on the fly (not recommended). Only use this if you're not including the image parameter.
   */
  image_data: string

  /**
   * Name of the item.
   */
  name: string

  /**
   * A URL to a YouTube video.
   */
  youtube_url: string
}

export interface OpenSeaNftInfo extends NftInfo {
  contract: string
  metadata: OpenSeaNftMetadata
  supply: string
  tokenId: string
  type: string
}

export type NftInfoPayload = Payload<NftInfo & { schema: NftSchema }>

export const isNftInfoPayload = (payload: Payload): payload is NftInfoPayload => {
  return payload.schema === NftSchema
}
