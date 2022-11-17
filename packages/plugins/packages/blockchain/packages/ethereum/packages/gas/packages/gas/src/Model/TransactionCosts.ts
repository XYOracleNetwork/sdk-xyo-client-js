import { BaseFeeRange } from './BaseFeeRange'
import { GasRange } from './GasRange'
import { PriorityFeeRange } from './PriorityFeeRange'

export interface TransactionCosts {
  baseFee: BaseFeeRange
  gas: GasRange
  priorityFee: PriorityFeeRange
}
