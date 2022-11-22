import { sampleEthgasstationGas } from '../../test'
import { isXyoEthereumGasEthgasstationPayload } from './isXyoEthereumGasEthgasstationPayload'

describe('isXyoEthereumGasEthgasstationPayload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasEthgasstationSchema', () => {
      const result = isXyoEthereumGasEthgasstationPayload(sampleEthgasstationGas)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasEthgasstationSchema', () => {
      const result = isXyoEthereumGasEthgasstationPayload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasEthgasstationPayload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasEthgasstationPayload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasEthgasstationPayload(null)
      expect(result).toBeFalse()
    })
  })
})
