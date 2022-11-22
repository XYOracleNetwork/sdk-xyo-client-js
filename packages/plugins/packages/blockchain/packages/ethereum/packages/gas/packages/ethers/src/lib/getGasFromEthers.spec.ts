import { getGasFromEthers } from './getGasFromEthers'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: boolean | string | null | undefined) => (condition ? it : it.skip)

describe('getGasFromEthers', () => {
  testIf(apiKey)('returns prices', async () => {
    const gas = await getGasFromEthers(apiKey)
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
