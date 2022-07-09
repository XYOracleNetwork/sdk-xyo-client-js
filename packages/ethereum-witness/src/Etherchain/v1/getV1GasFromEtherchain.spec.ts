import { getV1GasFromEtherchain } from './getV1GasFromEtherchain'

describe('getV1GasFromEtherchain', () => {
  test('returns prices', async () => {
    const gas = await getV1GasFromEtherchain()
    expect(gas).toBeObject()
    expect(gas.currentBaseFee).toBeNumber()
    expect(gas.fast).toBeNumber()
    expect(gas.fastest).toBeNumber()
    expect(gas.recommendedBaseFee).toBeNumber()
    expect(gas.safeLow).toBeNumber()
    expect(gas.standard).toBeNumber()
  })
})
