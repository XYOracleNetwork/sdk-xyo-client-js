import {
  asSchema, type Payload, type Query,
} from '@xyo-network/payload-model'

import type { TransformSettings } from './Config/index.ts'
import { TransformDivinerSchema } from './Schema.ts'

export const TransformDivinerQuerySchema = asSchema(`${TransformDivinerSchema}.query`, true)
export type TransformDivinerQuerySchema = typeof TransformDivinerQuerySchema

export type TransformDivinerQueryPayload = Query<{ schema: TransformDivinerQuerySchema } & Partial<TransformSettings>>
export const isTransformDivinerQueryPayload = (x?: Payload | null): x is TransformDivinerQueryPayload => x?.schema === TransformDivinerQuerySchema
