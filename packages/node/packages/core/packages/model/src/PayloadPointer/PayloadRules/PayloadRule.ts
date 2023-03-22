import { PayloadAddressRule, PayloadSchemaRule, PayloadTimestampDirectionRule } from './Rules'

export type PayloadRule = PayloadAddressRule | PayloadTimestampDirectionRule | PayloadSchemaRule
