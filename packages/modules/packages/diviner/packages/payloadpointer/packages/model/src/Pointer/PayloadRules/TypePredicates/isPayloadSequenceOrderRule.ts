import { exists } from '@xylabs/exists'
import { isSequence } from '@xyo-network/payload-model'

import type { PayloadRule } from '../PayloadRule.ts'
import type { PayloadSequenceOrderRule } from '../Rules/index.ts'

export const isPayloadSequenceOrderRule = (rule: PayloadRule): rule is PayloadSequenceOrderRule => {
  const { order, sequence } = rule as Partial<PayloadSequenceOrderRule>
  // If sequence is defined, but not a sequence, it's not a PayloadSequenceOrderRule
  if (exists(sequence) && !isSequence(sequence)) return false
  // If neither order or sequence is defined, it's not a PayloadSequenceOrderRule
  if (!exists(order) && !exists(sequence)) return false
  // If order is defined, but not a valid order, it's not a PayloadSequenceOrderRule
  if (order && order !== 'asc' && order !== 'desc') return false
  // It's a PayloadSequenceOrderRule
  return true
}
