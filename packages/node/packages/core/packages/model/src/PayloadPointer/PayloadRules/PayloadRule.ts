import { PayloadAddressRule, PayloadArchiveRule, PayloadSchemaRule, PayloadTimestampDirectionRule } from './Rules'

export type PayloadRule = PayloadAddressRule | PayloadArchiveRule | PayloadTimestampDirectionRule | PayloadSchemaRule
