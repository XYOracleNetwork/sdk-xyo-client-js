import { sampleEtherchainGasV2 } from '../../test'
import { isXyoEthereumGasEtherchainV2Payload } from './isXyoEthereumGasEtherchainV2Payload'

describe('isXyoEthereumGasEtherchainV2Payload', () => {
  describe('returns true', () => {
    it('when payload schema is XyoEthereumGasEtherchainV2Schema', () => {
      const result = isXyoEthereumGasEtherchainV2Payload(sampleEtherchainGasV2)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not XyoEthereumGasEtherscanSchema', () => {
      const result = isXyoEthereumGasEtherchainV2Payload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isXyoEthereumGasEtherchainV2Payload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isXyoEthereumGasEtherchainV2Payload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isXyoEthereumGasEtherchainV2Payload(null)
      expect(result).toBeFalse()
    })
  })
})
