import { PayloadRule } from '../PayloadRule'
import { PayloadAddressRule } from '../Rules'

export const isPayloadAddressRule = (rule: PayloadRule): rule is PayloadAddressRule => {
  return !!(rule as PayloadAddressRule)?.address
}
