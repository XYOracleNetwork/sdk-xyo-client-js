import { dumpErrors } from '../../lib'
import { testBoundWitness } from '../../Test'
import { XyoBoundWitnessValidator } from './Validator'

test('all', () => {
  const validator = new XyoBoundWitnessValidator(testBoundWitness)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
