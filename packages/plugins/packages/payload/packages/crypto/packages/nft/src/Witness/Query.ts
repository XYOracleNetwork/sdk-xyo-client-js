import { Payload } from '@xyo-network/payload-model'

import { NftWitnessQuerySchema } from './Schema'

export type NftWitnessQueryPayload = Payload<{
  address?: string
  chainId?: number
  schema: NftWitnessQuerySchema
}>
