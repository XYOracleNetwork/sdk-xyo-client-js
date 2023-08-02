import { Payload } from '@xyo-network/payload-model'

import { NftCollectionWitnessQuerySchema } from './Schema'

export type NftCollectionWitnessQueryPayload = Payload<{
  address?: string
  chainId?: number
  schema: NftCollectionWitnessQuerySchema
}>
export const isNftCollectionWitnessQueryPayload = (x?: Payload | null): x is NftCollectionWitnessQueryPayload =>
  x?.schema === NftCollectionWitnessQuerySchema
