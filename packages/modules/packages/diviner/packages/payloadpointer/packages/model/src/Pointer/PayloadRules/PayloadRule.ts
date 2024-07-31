import { PayloadAddressRule, PayloadSchemaRule, PayloadTimestampOrderRule } from './Rules/index.js'

export type PayloadRule = PayloadAddressRule | PayloadTimestampOrderRule | PayloadSchemaRule
