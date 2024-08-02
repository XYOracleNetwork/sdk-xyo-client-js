import { PayloadRule } from '../PayloadRule.ts'
import { PayloadAddressRule } from '../Rules/index.ts'

export const isPayloadAddressRule = (rule: PayloadRule): rule is PayloadAddressRule => {
  return !!(rule as PayloadAddressRule)?.address
}
