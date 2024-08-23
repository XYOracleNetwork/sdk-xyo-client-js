import type {
  PayloadAddressRule, PayloadSchemaRule, PayloadTimestampOrderRule,
} from './Rules/index.ts'

export type PayloadRule = PayloadAddressRule | PayloadTimestampOrderRule | PayloadSchemaRule
