import {
  PayloadAddressRule, PayloadSchemaRule, PayloadSequenceOrderRule,
} from './Rules/index.ts'

export type PayloadRule = PayloadAddressRule | PayloadSequenceOrderRule | PayloadSchemaRule
