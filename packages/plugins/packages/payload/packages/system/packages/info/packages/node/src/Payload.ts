import { Payload } from '@xyo-network/payload-model'

import { NodeSystemInfoSchema } from './Schema'

export type NodeSystemInfoPayload = Payload<{
  schema: NodeSystemInfoSchema
  systeminfo?: Record<string, unknown>
}>
