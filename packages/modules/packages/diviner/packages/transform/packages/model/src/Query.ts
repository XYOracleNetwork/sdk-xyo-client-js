import { Payload, Query } from '@xyo-network/payload-model'

import { TransformSettings } from './Config/index.js'
import { TransformDivinerSchema } from './Schema.js'

export type TransformDivinerQuerySchema = `${TransformDivinerSchema}.query`
export const TransformDivinerQuerySchema: TransformDivinerQuerySchema = `${TransformDivinerSchema}.query`

export type TransformDivinerQueryPayload = Query<{ schema: TransformDivinerQuerySchema } & Partial<TransformSettings>>
export const isTransformDivinerQueryPayload = (x?: Payload | null): x is TransformDivinerQueryPayload => x?.schema === TransformDivinerQuerySchema
