import type { DivinerConfig } from '@xyo-network/diviner-model'
import { asSchema } from '@xyo-network/payload-model'

import type { TransformDictionary } from '../Payload/index.ts'
import { TransformDivinerSchema } from '../Schema.ts'

export const TransformDivinerConfigSchema = asSchema(`${TransformDivinerSchema}.config`, true)
export type TransformDivinerConfigSchema = typeof TransformDivinerConfigSchema

export type TransformDivinerConfig = DivinerConfig<{ transform?: TransformDictionary } & { schema: TransformDivinerConfigSchema }>
