import { sampleEtherscanGas } from '../../test'
import { isXyoEthereumGasEtherscanPayload } from './isXyoEthereumGasEtherscanPayload'

describe('isXyoEthereumGasEtherscanPayload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasEtherscanSchema', () => {
      const result = isXyoEthereumGasEtherscanPayload(sampleEtherscanGas)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasEtherscanSchema', () => {
      const result = isXyoEthereumGasEtherscanPayload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasEtherscanPayload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasEtherscanPayload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasEtherscanPayload(null)
      expect(result).toBeFalse()
    })
  })
})
