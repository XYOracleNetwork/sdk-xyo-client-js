import { exists } from '@xylabs/exists'

import { BaseFee, FeeData, FeePerGas, PriorityFeePerGas } from '../Model'

type PropertyArray<Type> = {
  [Property in keyof Type]: Array<number>
}

interface FeeDataPropertyArray {
  baseFee: PropertyArray<BaseFee>
  feePerGas: PropertyArray<FeePerGas>
  priorityFeePerGas: PropertyArray<PriorityFeePerGas>
}

interface PartialFeedData {
  baseFee: Partial<BaseFee>
  feePerGas: Partial<FeePerGas>
  priorityFeePerGas: Partial<PriorityFeePerGas>
}

const listAverage = (x?: number[]) => (x?.length ? x.reduce((a, b) => a + b) / x.length : undefined)

const averageProperty = (data: FeeData[], propertyExpression: (x: FeeData) => number | undefined) => {
  return listAverage(data.map(propertyExpression).filter(exists))
}

export const average = (input?: (FeeData | undefined)[]): FeeData => {
  // Get all the assets represented
  const filtered = input?.filter(exists) || []
  const count = filtered.length
  if (count < 1) {
    throw new Error('Unable to compute average on empty list')
  }
  // TODO: We should sum per property and divide by existent properties
  // to allow for the handling of missing/undefined values
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
  const feeDataList: FeeDataPropertyArray = {
    baseFee: {
      medium: filtered.map((x) => x.baseFee.medium).filter(exists),
    },
    feePerGas: {
      high: filtered.map((x) => x.feePerGas.high).filter(exists),
      low: filtered.map((x) => x.feePerGas.low).filter(exists),
      medium: filtered.map((x) => x.feePerGas.medium).filter(exists),
      veryHigh: filtered.map((x) => x.feePerGas.veryHigh).filter(exists),
    },
    priorityFeePerGas: {
      high: filtered.map((x) => x.priorityFeePerGas.high).filter(exists),
      low: filtered.map((x) => x.priorityFeePerGas.low).filter(exists),
      medium: filtered.map((x) => x.priorityFeePerGas.medium).filter(exists),
      veryHigh: filtered.map((x) => x.priorityFeePerGas.veryHigh).filter(exists),
    },
  }
  const avg: PartialFeedData = {
    baseFee: {
      medium: listAverage(feeDataList.baseFee.medium),
    },
    feePerGas: {
      high: listAverage(feeDataList.feePerGas.high),
      low: listAverage(feeDataList.feePerGas.low),
      medium: listAverage(feeDataList.feePerGas.medium),
      veryHigh: listAverage(feeDataList.feePerGas.veryHigh),
    },
    priorityFeePerGas: {
      high: listAverage(feeDataList.priorityFeePerGas.high),
      low: listAverage(feeDataList.priorityFeePerGas.low),
      medium: listAverage(feeDataList.priorityFeePerGas.medium),
      veryHigh: listAverage(feeDataList.priorityFeePerGas.veryHigh),
    },
  }
  const otherAvg: PartialFeedData = {
    baseFee: {
      medium: listAverage(filtered.map((x) => x.baseFee.medium).filter(exists)),
    },
    feePerGas: {
      high: listAverage(filtered.map((x) => x.feePerGas.high).filter(exists)),
      low: listAverage(filtered.map((x) => x.feePerGas.low).filter(exists)),
      medium: listAverage(filtered.map((x) => x.feePerGas.medium).filter(exists)),
      veryHigh: listAverage(filtered.map((x) => x.feePerGas.veryHigh).filter(exists)),
    },
    priorityFeePerGas: {
      high: listAverage(filtered.map((x) => x.priorityFeePerGas.high).filter(exists)),
      low: listAverage(filtered.map((x) => x.priorityFeePerGas.low).filter(exists)),
      medium: listAverage(filtered.map((x) => x.priorityFeePerGas.medium).filter(exists)),
      veryHigh: listAverage(filtered.map((x) => x.priorityFeePerGas.veryHigh).filter(exists)),
    },
  }
  const otherOtherAvg: PartialFeedData = {
    baseFee: {
      medium: averageProperty(filtered, (x) => x.baseFee.medium),
    },
    feePerGas: {
      high: averageProperty(filtered, (x) => x.feePerGas.high),
      low: averageProperty(filtered, (x) => x.feePerGas.low),
      medium: averageProperty(filtered, (x) => x.feePerGas.medium),
      veryHigh: averageProperty(filtered, (x) => x.feePerGas.veryHigh),
    },
    priorityFeePerGas: {
      high: averageProperty(filtered, (x) => x.priorityFeePerGas.high),
      low: averageProperty(filtered, (x) => x.priorityFeePerGas.low),
      medium: averageProperty(filtered, (x) => x.priorityFeePerGas.medium),
      veryHigh: averageProperty(filtered, (x) => x.priorityFeePerGas.veryHigh),
    },
  }
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
