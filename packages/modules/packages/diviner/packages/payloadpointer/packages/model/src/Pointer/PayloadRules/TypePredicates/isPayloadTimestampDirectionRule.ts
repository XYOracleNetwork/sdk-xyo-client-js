import { PayloadRule } from '../PayloadRule.ts'
import { PayloadTimestampOrderRule } from '../Rules/index.ts'

export const isPayloadTimestampOrderRule = (rule: PayloadRule): rule is PayloadTimestampOrderRule => {
  return typeof (rule as PayloadTimestampOrderRule)?.timestamp === 'number'
}
