import { PayloadRule } from '../PayloadRule'
import { PayloadTimestampDirectionRule } from '../Rules'

export const isPayloadTimestampDirectionRule = (rule: PayloadRule): rule is PayloadTimestampDirectionRule => {
  return !isNaN((rule as PayloadTimestampDirectionRule)?.timestamp)
}
