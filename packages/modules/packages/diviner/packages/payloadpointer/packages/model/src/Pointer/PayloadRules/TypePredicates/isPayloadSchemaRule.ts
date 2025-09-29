import { isString } from '@xylabs/typeof'

import type { PayloadRule } from '../PayloadRule.ts'
import type { PayloadSchemaRule } from '../Rules/index.ts'

export const isPayloadSchemaRule = (rule: PayloadRule): rule is PayloadSchemaRule => {
  return isString((rule as PayloadSchemaRule)?.schema)
}
