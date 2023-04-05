import { Payload } from '@xyo-network/payload-model'
import { Parser } from 'bowser'

import { XyoBowserSystemInfoSchema } from './Schema'

export type XyoBowserSystemInfoPayload = Payload<{
  bowser?: Parser.ParsedResult
  schema: XyoBowserSystemInfoSchema
}>
