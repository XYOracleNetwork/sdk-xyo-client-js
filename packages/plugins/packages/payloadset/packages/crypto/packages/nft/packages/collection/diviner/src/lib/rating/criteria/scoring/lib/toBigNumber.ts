import { BigNumber } from '@xylabs/bignumber'

export const toBigNumber = (value: string): BigNumber | undefined => {
  try {
    return new BigNumber(value)
  } catch (error) {
    return undefined
  }
}
