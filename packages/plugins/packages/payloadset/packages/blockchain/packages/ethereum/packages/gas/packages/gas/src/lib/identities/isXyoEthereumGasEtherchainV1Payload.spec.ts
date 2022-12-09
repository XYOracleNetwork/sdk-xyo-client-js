import { sampleEtherchainGasV1 } from '../../test'
import { isXyoEthereumGasEtherchainV1Payload } from './isXyoEthereumGasEtherchainV1Payload'

describe('isXyoEthereumGasEtherchainV1Payload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasEtherchainV1Schema', () => {
      const result = isXyoEthereumGasEtherchainV1Payload(sampleEtherchainGasV1)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasEtherscanSchema', () => {
      const result = isXyoEthereumGasEtherchainV1Payload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasEtherchainV1Payload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasEtherchainV1Payload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasEtherchainV1Payload(null)
      expect(result).toBeFalse()
    })
  })
})
