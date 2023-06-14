import { sampleEtherscanGas } from '../../../test'
import { isEthereumGasEtherscanPayload } from '../isEthereumGasEtherscanPayload'

describe('isEthereumGasEtherscanPayload', () => {
  describe('returns true', () => {
    it('when payload schema is EthereumGasEtherscanSchema', () => {
      const result = isEthereumGasEtherscanPayload(sampleEtherscanGas)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not EthereumGasEtherscanSchema', () => {
      const result = isEthereumGasEtherscanPayload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isEthereumGasEtherscanPayload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isEthereumGasEtherscanPayload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isEthereumGasEtherscanPayload(null)
      expect(result).toBeFalse()
    })
  })
})
