import { dumpErrors } from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import { XyoBoundWitnessValidator } from './Validator'

test('all', () => {
  const validator = new XyoBoundWitnessValidator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
