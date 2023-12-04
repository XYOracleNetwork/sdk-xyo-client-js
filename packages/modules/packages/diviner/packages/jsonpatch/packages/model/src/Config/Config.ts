import { DivinerConfig } from '@xyo-network/diviner-model'

import { TransformDictionary } from '../Payload'
import { TransformDivinerSchema } from '../Schema'

export type TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`
export const TransformDivinerConfigSchema: TransformDivinerConfigSchema = `${TransformDivinerSchema}.config`

export type TransformDivinerConfig = DivinerConfig<{ jsonpatch?: TransformDictionary } & { schema: TransformDivinerConfigSchema }>
