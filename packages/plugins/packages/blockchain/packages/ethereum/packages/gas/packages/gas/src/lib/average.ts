import { exists } from '@xylabs/exists'

import { FeeData } from '../Model'

const listAverage = (x?: number[]) => (x?.length ? x.reduce((a, b) => a + b) / x.length : undefined)

const averageProperty = (data: FeeData[], propertyExpression: (x: FeeData) => number | undefined) => {
  return listAverage(data.map(propertyExpression).filter(exists))
}

export const average = (input?: (FeeData | undefined)[]): FeeData => {
  const data = input?.filter(exists) || []
  if (data.length < 1) {
    throw new Error('Unable to compute average on empty list')
  }
  const averaged: FeeData = {
    baseFee: averageProperty(data, (x) => x.baseFee),
    feePerGas: {
      high: averageProperty(data, (x) => x.feePerGas.high),
      low: averageProperty(data, (x) => x.feePerGas.low),
      medium: averageProperty(data, (x) => x.feePerGas.medium),
      veryHigh: averageProperty(data, (x) => x.feePerGas.veryHigh),
    },
    priorityFeePerGas: {
      high: averageProperty(data, (x) => x.priorityFeePerGas.high),
      low: averageProperty(data, (x) => x.priorityFeePerGas.low),
      medium: averageProperty(data, (x) => x.priorityFeePerGas.medium),
      veryHigh: averageProperty(data, (x) => x.priorityFeePerGas.veryHigh),
    },
  }
  return averaged
}
