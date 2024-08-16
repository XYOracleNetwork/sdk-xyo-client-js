import type { PayloadRule } from '../PayloadRule.ts'
import type { PayloadTimestampOrderRule } from '../Rules/index.ts'

export const isPayloadTimestampOrderRule = (rule: PayloadRule): rule is PayloadTimestampOrderRule => {
  return typeof (rule as PayloadTimestampOrderRule)?.timestamp === 'number'
}
