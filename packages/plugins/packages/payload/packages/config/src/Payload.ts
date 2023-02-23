import { XyoPayload } from '@xyo-network/payload-model'

import { ConfigSchema } from './Schema'

export type ConfigPayload = XyoPayload<{
  config: string
  schema: ConfigSchema
}>
