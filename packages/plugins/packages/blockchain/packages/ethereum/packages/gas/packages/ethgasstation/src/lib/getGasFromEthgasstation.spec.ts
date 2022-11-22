import { getGasFromEthgasstation } from './getGasFromEthgasstation'

describe('getGasFromEthgasstation', () => {
  test('returns prices', async () => {
    const gas = await getGasFromEthgasstation()
    expect(gas).toBeTruthy()
    expect(gas.status).toEqual('1')
    expect(gas.message).toEqual('OK')
    expect(gas.result).toBeObject()
    expect(gas.result.FastGasPrice).toBeString()
    expect(gas.result.LastBlock).toBeString()
    expect(gas.result.ProposeGasPrice).toBeString()
    expect(gas.result.SafeGasPrice).toBeString()
    expect(gas.result.gasUsedRatio).toBeString()
    expect(gas.result.suggestBaseFee).toBeString()
  })
})
