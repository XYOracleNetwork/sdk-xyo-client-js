import { Payload } from '@xyo-network/payload-model'

import { ConfigSchema } from './Schema'

export type ConfigPayload = Payload<{
  config: string
  schema: ConfigSchema
}>
