import { PayloadRule } from '../PayloadRule.js'
import { PayloadSchemaRule } from '../Rules/index.js'

export const isPayloadSchemaRule = (rule: PayloadRule): rule is PayloadSchemaRule => {
  return !!(rule as PayloadSchemaRule)?.schema
}
