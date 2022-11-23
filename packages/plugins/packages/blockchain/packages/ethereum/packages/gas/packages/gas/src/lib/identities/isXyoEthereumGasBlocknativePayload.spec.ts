import { sampleBlocknativeGas } from '../../test'
import { isXyoEthereumGasBlocknativePayload } from './isXyoEthereumGasBlocknativePayload'

describe('isXyoEthereumGasBlocknativePayload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasBlocknativeSchema', () => {
      const result = isXyoEthereumGasBlocknativePayload(sampleBlocknativeGas)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasBlocknativeSchema', () => {
      const result = isXyoEthereumGasBlocknativePayload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasBlocknativePayload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasBlocknativePayload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasBlocknativePayload(null)
      expect(result).toBeFalse()
    })
  })
})
