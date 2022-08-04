import { XyoPayload } from '@xyo-network/payload'
import { Parser } from 'bowser'

import { XyoBowserSystemInfoPayloadSchema } from './Schema'

export type XyoBowserSystemInfoPayload = XyoPayload<{
  schema: XyoBowserSystemInfoPayloadSchema
  bowser?: Parser.ParsedResult
}>
