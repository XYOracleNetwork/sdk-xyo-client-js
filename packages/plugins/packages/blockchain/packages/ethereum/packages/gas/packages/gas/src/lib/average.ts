import { exists } from '@xylabs/exists'

import { FeeData } from '../Model'

/**
 * Averages an array of numbers
 * @param x Averages an array of numbers
 * @returns The average of the array of numbers or undefined if the
 * array is empty or undefined
 */
const listAverage = (x?: number[]) => (x?.length ? x.reduce((a, b) => a + b) / x.length : undefined)

/**
 * Averages the property indicates by the supplied property
 * expression across the array of FeeData
 * @param data The array of data to average
 * @param propertyExpression The expression for the property to
 * average
 * @returns The average of the supplied property across the array
 */
const averageProperty = (data: FeeData[], propertyExpression: (x: FeeData) => number | undefined) => {
  return listAverage(data.map(propertyExpression).filter(exists))
}

/**
 * Averages the supplied FeeData
 * @param input An array of FeeData or undefined
 * @returns The average of the supplied FeeData
 */
export const average = (input?: (FeeData | undefined)[]): FeeData => {
  const data = input?.filter(exists) || []
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
