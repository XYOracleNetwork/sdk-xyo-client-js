import { getGasFromEtherchain } from './getGasFromEtherchain'

describe('getGasFromEtherchain', () => {
  test('returns prices', async () => {
    const gas = await getGasFromEtherchain()
    expect(gas).toBeObject()
    expect(gas.currentBaseFee).toBeNumber()
    expect(gas.fast).toBeNumber()
    expect(gas.fastest).toBeNumber()
    expect(gas.recommendedBaseFee).toBeNumber()
    expect(gas.safeLow).toBeNumber()
    expect(gas.standard).toBeNumber()
  })
})
