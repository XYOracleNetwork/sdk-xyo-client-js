import { exists } from '@xylabs/exists'

import { FeeData } from '../Model'

export const average = (input?: (FeeData | undefined)[]): FeeData => {
  // Get all the assets represented
  const filtered = input?.filter(exists) || []
  const count = filtered.length
  if (count < 1) {
    throw new Error('Unable to compute average on empty list')
  }
  const sum: FeeData = filtered.reduce((a, b) => {
    return {
      baseFee: {
        medium: a.baseFee.medium + b.baseFee.medium,
      },
      feePerGas: {
        high: a.feePerGas.high + b.feePerGas.high,
        low: a.feePerGas.low + b.feePerGas.low,
        medium: a.feePerGas.medium + b.feePerGas.low,
        veryHigh: a.feePerGas.veryHigh + b.feePerGas.veryHigh,
      },
      priorityFeePerGas: {
        low: a.priorityFeePerGas.low + b.priorityFeePerGas.low,
        medium: a.priorityFeePerGas.medium + b.priorityFeePerGas.medium,
      },
    }
  }, filtered[0])
  const average: FeeData = {
    baseFee: {
      medium: sum.baseFee.medium / count,
    },
    feePerGas: {
      high: sum.feePerGas.high / count,
      low: sum.feePerGas.low / count,
      medium: sum.feePerGas.medium / count,
      veryHigh: sum.feePerGas.veryHigh / count,
    },
    priorityFeePerGas: {
      low: sum.priorityFeePerGas.low / count,
      medium: sum.priorityFeePerGas.medium / count,
    },
  }
  return average
}
