import { Payload } from '@xyo-network/payload-model'

import { UrlSchema } from './Schema'

export type UrlPayload = Payload<{
  schema: UrlSchema
  url: string
}>
