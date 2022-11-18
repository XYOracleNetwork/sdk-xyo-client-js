import { BaseFeeRange } from './BaseFeeRange'
import { GasRange } from './GasRange'
import { PriorityFeePerGas } from './PriorityFeePerGas'

export interface TransactionCosts {
  baseFee: BaseFeeRange
  gas: GasRange
  priorityFee: PriorityFeePerGas
}
