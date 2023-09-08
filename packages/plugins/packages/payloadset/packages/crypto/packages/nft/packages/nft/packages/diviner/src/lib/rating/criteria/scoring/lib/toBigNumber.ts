import BigNumber from 'bn.js'

export const toBigNumber = (value: string): BigNumber | undefined => {
  try {
    return new BigNumber(value)
  } catch (error) {
    return undefined
  }
}
