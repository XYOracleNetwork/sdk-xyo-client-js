import { getV2GasFromEthgasstation } from './getV2GasFromEthgasstation'

describe('getV2GasFromEthgasstation', () => {
  test('returns prices', async () => {
    const gas = await getV2GasFromEthgasstation()
    expect(gas).toBeObject()
    expect(gas.code).toBeNumber()
    expect(gas.data).toBeObject()
    expect(gas.data.fast).toBeNumber()
    expect(gas.data.priceUSD).toBeNumber()
    expect(gas.data.rapid).toBeNumber()
    expect(gas.data.slow).toBeNumber()
    expect(gas.data.standard).toBeNumber()
    expect(gas.data.timestamp).toBeNumber()
  })
})
