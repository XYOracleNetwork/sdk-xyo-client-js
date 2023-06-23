import { toBigNumber } from './toBigNumber'

export const isValidPositiveBigNumber = (value: string): boolean => {
  const num = toBigNumber(value)
  return !num || num.isNeg() ? false : true
}
