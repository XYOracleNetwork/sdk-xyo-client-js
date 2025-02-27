import type { PayloadRule } from '../PayloadRule.ts'
import type { PayloadSchemaRule } from '../Rules/index.ts'

export const isPayloadSchemaRule = (rule: PayloadRule): rule is PayloadSchemaRule => {
  return !!(rule as PayloadSchemaRule)?.schema
}
