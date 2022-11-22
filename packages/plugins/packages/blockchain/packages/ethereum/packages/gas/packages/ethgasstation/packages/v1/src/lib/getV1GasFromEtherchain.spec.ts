import { getV1GasFromEthgasstation } from './getV1GasFromEthgasstation'

describe('getV1GasFromEthgasstation', () => {
  test('returns prices', async () => {
    const gas = await getV1GasFromEthgasstation()
    expect(gas).toBeObject()
    expect(gas.currentBaseFee).toBeNumber()
    expect(gas.fast).toBeNumber()
    expect(gas.fastest).toBeNumber()
    expect(gas.recommendedBaseFee).toBeNumber()
    expect(gas.safeLow).toBeNumber()
    expect(gas.standard).toBeNumber()
  })
})
