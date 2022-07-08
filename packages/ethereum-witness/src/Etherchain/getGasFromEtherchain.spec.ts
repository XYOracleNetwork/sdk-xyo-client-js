import { getGasFromEtherchain } from './getGasFromEtherchain'

describe('getGasFromEtherchain', () => {
  test('returns prices', async () => {
    const gas = await getGasFromEtherchain()
    expect(gas).toBeTruthy()
    expect(gas.currentBaseFee).toBeDefined()
    expect(gas.fast).toBeDefined()
    expect(gas.fastest).toBeDefined()
    expect(gas.recommendedBaseFee).toBeDefined()
    expect(gas.safeLow).toBeDefined()
    expect(gas.standard).toBeDefined()
  })
})
