import { NftAttribute } from './NftAttribute'

export interface NftMetadata {
  [key: string]: unknown
  attributes?: NftAttribute[] | unknown
  description?: unknown
  image?: unknown
  name?: unknown
}
