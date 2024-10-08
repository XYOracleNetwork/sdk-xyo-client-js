import type { Payload, Query } from '@xyo-network/payload-model'

import type { TransformSettings } from './Config/index.ts'
import { TransformDivinerSchema } from './Schema.ts'

export type TransformDivinerQuerySchema = `${TransformDivinerSchema}.query`
export const TransformDivinerQuerySchema: TransformDivinerQuerySchema = `${TransformDivinerSchema}.query`

export type TransformDivinerQueryPayload = Query<{ schema: TransformDivinerQuerySchema } & Partial<TransformSettings>>
export const isTransformDivinerQueryPayload = (x?: Payload | null): x is TransformDivinerQueryPayload => x?.schema === TransformDivinerQuerySchema
