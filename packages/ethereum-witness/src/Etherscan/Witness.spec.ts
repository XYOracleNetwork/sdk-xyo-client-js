import { XyoEtherscanEthereumGasWitness } from './Witness'

const apiKey = process.env.ETHERSCAN_API_KEY || ''

const testIf = (condition: string | undefined) => (condition ? it : it.skip)

describe('Witness', () => {
  testIf(apiKey)('returns observation', async () => {
    const sut = new XyoEtherscanEthereumGasWitness({ schema: XyoEtherscanEthereumGasWitness.schema }, apiKey)
    const actual = await sut.observe()
    expect(actual.fastGasPrice).toBeNumber()
    expect(actual.gasUsedRatio).toBeArray()
    expect(actual.gasUsedRatio.length).toBeGreaterThan(0)
    actual.gasUsedRatio.map((x) => expect(x).toBeNumber())
    expect(actual.lastBlock).toBeNumber()
    expect(actual.proposeGasPrice).toBeNumber()
    expect(actual.safeGasPrice).toBeNumber()
    expect(actual.suggestBaseFee).toBeNumber()

    expect(actual.timestamp).toBeNumber()
    expect(actual.schema).toBe(XyoEtherscanEthereumGasWitness.schema)
  })
})
