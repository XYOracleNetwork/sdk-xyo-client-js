import { getGasFromEthgasstation } from './getGasFromEthgasstation'

describe('getGasFromEthgasstation', () => {
  test('returns prices', async () => {
    const result = await getGasFromEthgasstation()
    expect(result).toBeObject()
    expect(result.baseFee).toBeNumber()
    expect(result.blockNumber).toBeNumber()
    expect(result.blockTime).toBeNumber()
    expect(result.gasPrice).toBeObject()
    expect(result.gasPrice.fast).toBeNumber()
    expect(result.gasPrice.instant).toBeNumber()
    expect(result.gasPrice.standard).toBeNumber()
    expect(result.nextBaseFee).toBeNumber()
    expect(result.priorityFee).toBeObject()
    expect(result.priorityFee.fast).toBeNumber()
    expect(result.priorityFee.instant).toBeNumber()
    expect(result.priorityFee.standard).toBeNumber()
  })
})
