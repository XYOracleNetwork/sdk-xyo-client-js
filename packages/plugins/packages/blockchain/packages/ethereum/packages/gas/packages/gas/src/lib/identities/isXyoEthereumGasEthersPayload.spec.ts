import { sampleEthersGas } from '../../test'
import { isXyoEthereumGasEthersPayload } from './isXyoEthereumGasEthersPayload'

describe('isXyoEthereumGasEthersPayload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasEthersSchema', () => {
      const result = isXyoEthereumGasEthersPayload(sampleEthersGas)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasEthersSchema', () => {
      const result = isXyoEthereumGasEthersPayload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasEthersPayload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasEthersPayload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasEthersPayload(null)
      expect(result).toBeFalse()
    })
  })
})
