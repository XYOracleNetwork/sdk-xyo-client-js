import type { DivinerConfig } from '@xyo-network/diviner-model'

import type { TransformDictionary } from '../Payload/index.ts'
import { TransformDivinerSchema } from '../Schema.ts'

export type TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`
export const TransformDivinerConfigSchema: TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`

export type TransformDivinerConfig = DivinerConfig<{ transform?: TransformDictionary } & { schema: TransformDivinerConfigSchema }>
