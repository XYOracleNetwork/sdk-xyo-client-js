import { PayloadRule } from '../PayloadRule.js'
import { PayloadTimestampOrderRule } from '../Rules/index.js'

export const isPayloadTimestampOrderRule = (rule: PayloadRule): rule is PayloadTimestampOrderRule => {
  return typeof (rule as PayloadTimestampOrderRule)?.timestamp === 'number'
}
