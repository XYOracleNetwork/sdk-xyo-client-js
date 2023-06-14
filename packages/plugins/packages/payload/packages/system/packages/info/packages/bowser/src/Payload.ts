import { Payload } from '@xyo-network/payload-model'
import { Parser } from 'bowser'

import { BowserSystemInfoSchema } from './Schema'

export type BowserSystemInfoPayload = Payload<{
  bowser?: Parser.ParsedResult
  schema: BowserSystemInfoSchema
}>
