import { dumpErrors } from '../../../lib'
import { testBoundWitness } from '../../../Test'
import { XyoBoundWitness } from '../models'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

describe('XyoBoundWitnessMetaValidator', () => {
  it('Validates valid Meta', () => {
    const validator = new XyoBoundWitnessMetaValidator(testBoundWitness)
    const errors = validator.all()
    dumpErrors(errors)
    expect(errors.length).toBe(0)
  })
  describe('sourceIp', () => {
    it('Validates valid IPv4 Address', () => {
      const bw: XyoBoundWitness = {
        ...testBoundWitness,
        _source_ip: '127.0.0.1',
      }
      const validator = new XyoBoundWitnessMetaValidator(bw)
      const errors = validator.all()
      dumpErrors(errors)
      expect(errors.length).toBe(0)
    })
    it('Validates valid IPv6 Address', () => {
      const bw: XyoBoundWitness = {
        ...testBoundWitness,
        _source_ip: '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
      }
      const validator = new XyoBoundWitnessMetaValidator(bw)
      const errors = validator.all()
      dumpErrors(errors)
      expect(errors.length).toBe(0)
    })
    it('Handles missing Address', () => {
      const bw: XyoBoundWitness = {
        ...testBoundWitness,
        _source_ip: undefined,
      }
      const validator = new XyoBoundWitnessMetaValidator(bw)
      const errors = validator.all()
      dumpErrors(errors)
      expect(errors.length).toBe(0)
    })
    it('Detects invalid Addresses', () => {
      const bw: XyoBoundWitness = {
        ...testBoundWitness,
        _source_ip: 'notAnIpAddress',
      }
      const validator = new XyoBoundWitnessMetaValidator(bw)
      const errors = validator.all()
      dumpErrors(errors)
      expect(errors.length).toBe(0)
    })
  })
})
