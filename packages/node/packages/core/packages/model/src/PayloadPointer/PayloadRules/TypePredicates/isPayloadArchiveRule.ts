import { PayloadRule } from '../PayloadRule'
import { PayloadArchiveRule } from '../Rules'

export const isPayloadArchiveRule = (rule: PayloadRule): rule is PayloadArchiveRule => {
  return !!(rule as PayloadArchiveRule)?.archive
}
