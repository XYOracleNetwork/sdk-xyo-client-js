import { Payload } from '@xyo-network/payload-model'

import { NftSchema } from './Schema'

export interface NftAttribute {
  [key: string]: unknown
  display_type?: unknown
  trait_type?: unknown
  value?: unknown
}

export interface NftInfo {
  contract: string
  metadata?: {
    [key: string]: unknown
    attributes?: NftAttribute[] | unknown
    description?: unknown
    image?: unknown
    name?: unknown
  }
  supply: string
  tokenId: string
  type: string
}

export type NftInfoPayload = Payload<NftInfo & { schema: NftSchema }>

export const isNftInfoPayload = (payload: Payload): payload is NftInfoPayload => {
  return payload.schema === NftSchema
}
