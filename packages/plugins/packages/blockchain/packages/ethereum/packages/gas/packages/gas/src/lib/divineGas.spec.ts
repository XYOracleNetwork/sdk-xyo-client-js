import { sampleEtherchainGasV1, sampleEtherchainGasV2, sampleEtherscanGas } from '../test'
import { divineGas } from './divineGas'

describe.skip('divineGas', () => {
  describe('with no payloads supplied', () => {
    it('divines gas', () => {
      const result = divineGas([])
      expect(result).toBeObject()
      expect(result.timestamp).toBeNumber()
    })
  })
  describe('with sparse payloads supplied', () => {
    it.each([
      [sampleEtherchainGasV1],
      [sampleEtherchainGasV2],
      [sampleEtherscanGas],
      [sampleEtherchainGasV1, sampleEtherchainGasV2],
      [sampleEtherchainGasV2, sampleEtherscanGas],
      [sampleEtherchainGasV1, sampleEtherscanGas],
    ])('divines gas', (...payloads) => {
      const result = divineGas(payloads)
      expect(result).toBeObject()
      expect(result.timestamp).toBeNumber()
    })
  })
  describe('with one of each supported payload supplied', () => {
    it('divines gas', () => {
      const result = divineGas([sampleEtherchainGasV1, sampleEtherchainGasV2, sampleEtherscanGas])
      expect(result).toBeObject()
      expect(result.timestamp).toBeNumber()
    })
  })
  describe('with multiple of each supported payload supplied', () => {
    it('divines gas', () => {
      const result = divineGas([
        sampleEtherchainGasV1,
        sampleEtherchainGasV1,
        sampleEtherchainGasV2,
        sampleEtherchainGasV2,
        sampleEtherscanGas,
        sampleEtherscanGas,
      ])
      expect(result).toBeObject()
      expect(result.timestamp).toBeNumber()
    })
  })
})
