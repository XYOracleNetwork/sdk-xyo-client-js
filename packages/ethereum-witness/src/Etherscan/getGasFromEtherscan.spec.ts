import { getGasFromEtherscan } from './getGasFromEtherscan'

describe('getGasFromEtherscan', () => {
  test('returns prices', async () => {
    const gas = await getGasFromEtherscan()
    expect(gas).toBeTruthy()
    expect(gas.status).toBeDefined()
    expect(gas.message).toBeDefined()
    expect(gas.result).toBeDefined()
    expect(gas.result.FastGasPrice).toBeDefined()
    expect(gas.result.LastBlock).toBeDefined()
    expect(gas.result.ProposeGasPrice).toBeDefined()
    expect(gas.result.SafeGasPrice).toBeDefined()
    expect(gas.result.gasUsedRatio).toBeDefined()
    expect(gas.result.suggestBaseFee).toBeDefined()
  })
})
