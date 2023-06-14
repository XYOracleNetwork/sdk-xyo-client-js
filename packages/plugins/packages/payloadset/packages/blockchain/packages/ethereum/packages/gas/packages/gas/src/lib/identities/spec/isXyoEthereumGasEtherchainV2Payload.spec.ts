import { sampleEtherchainGasV2 } from '../../../test'
import { isEthereumGasEtherchainV2Payload } from '../isEthereumGasEtherchainV2Payload'

describe('isEthereumGasEtherchainV2Payload', () => {
  describe('returns true', () => {
    it('when payload schema is EthereumGasEtherchainV2Schema', () => {
      const result = isEthereumGasEtherchainV2Payload(sampleEtherchainGasV2)
      expect(result).toBeTrue()
    })
  })
  describe('returns false', () => {
    it('when payload schema is not EthereumGasEtherscanSchema', () => {
      const result = isEthereumGasEtherchainV2Payload({ schema: 'network.xyo.debug' })
      expect(result).toBeFalse()
    })
    it('when payload is missing', () => {
      const result = isEthereumGasEtherchainV2Payload()
      expect(result).toBeFalse()
    })
    it('when payload is undefined', () => {
      const result = isEthereumGasEtherchainV2Payload(undefined)
      expect(result).toBeFalse()
    })
    it('when payload is null', () => {
      const result = isEthereumGasEtherchainV2Payload(null)
      expect(result).toBeFalse()
    })
  })
})
