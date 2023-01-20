import { PayloadRule } from '../PayloadRule'
import { PayloadSchemaRule } from '../Rules'

export const isPayloadSchemaRule = (rule: PayloadRule): rule is PayloadSchemaRule => {
  return !!(rule as PayloadSchemaRule)?.schema
}
