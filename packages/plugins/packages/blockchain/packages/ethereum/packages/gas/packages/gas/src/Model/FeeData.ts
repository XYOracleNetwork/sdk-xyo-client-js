import { BaseFee } from './BaseFee'
import { FeePerGas } from './FeePerGas'
import { PriorityFeePerGas } from './PriorityFeePerGas'

export interface FeeData {
  baseFee: BaseFee
  feePerGas: FeePerGas
  priorityFeePerGas: PriorityFeePerGas
}
