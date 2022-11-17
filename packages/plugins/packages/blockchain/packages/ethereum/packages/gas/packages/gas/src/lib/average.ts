import { exists } from '@xylabs/exists'

import { TransactionCosts } from '../Model'

export const average = (input?: (TransactionCosts | undefined)[]): TransactionCosts => {
  // Get all the assets represented
  const filtered = input?.filter(exists) || []
  const count = filtered.length
  if (count < 1) {
    throw new Error('Unable to compute average on empty list')
  }
  const sum: TransactionCosts = filtered.reduce((a, b) => {
    return {
      baseFee: {
        medium: a.baseFee.medium + b.baseFee.medium,
      },
      gas: {
        high: a.gas.high + b.gas.high,
        low: a.gas.low + b.gas.low,
        medium: a.gas.medium + b.gas.low,
        veryHigh: a.gas.veryHigh + b.gas.veryHigh,
      },
      priorityFee: {
        low: a.priorityFee.low + b.priorityFee.low,
        medium: a.priorityFee.medium + b.priorityFee.medium,
      },
    }
  }, filtered[0])
  const average: TransactionCosts = {
    baseFee: {
      medium: sum.baseFee.medium / count,
    },
    gas: {
      high: sum.gas.high / count,
      low: sum.gas.low / count,
      medium: sum.gas.medium / count,
      veryHigh: sum.gas.veryHigh / count,
    },
    priorityFee: {
      low: sum.priorityFee.low / count,
      medium: sum.priorityFee.medium / count,
    },
  }
  return average
}
