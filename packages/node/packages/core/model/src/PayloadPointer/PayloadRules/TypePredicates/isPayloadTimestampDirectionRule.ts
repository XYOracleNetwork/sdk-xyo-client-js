import { PayloadRule } from '../PayloadRule'
import { PayloadTimestampDirectionRule } from '../Rules'

export const isPayloadTimestampDirectionRule = (rule: PayloadRule): rule is PayloadTimestampDirectionRule => {
  return !!(rule as PayloadTimestampDirectionRule)?.timestamp
}
