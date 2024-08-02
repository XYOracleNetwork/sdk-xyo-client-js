import { PayloadRule } from '../PayloadRule.ts'
import { PayloadSchemaRule } from '../Rules/index.ts'

export const isPayloadSchemaRule = (rule: PayloadRule): rule is PayloadSchemaRule => {
  return !!(rule as PayloadSchemaRule)?.schema
}
