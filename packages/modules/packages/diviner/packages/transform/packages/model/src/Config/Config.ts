import { DivinerConfig } from '@xyo-network/diviner-model'

import { TransformDictionary } from '../Payload/index.js'
import { TransformDivinerSchema } from '../Schema.js'

export type TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`
export const TransformDivinerConfigSchema: TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`

export type TransformDivinerConfig = DivinerConfig<{ transform?: TransformDictionary } & { schema: TransformDivinerConfigSchema }>
