import { dumpErrors } from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'

test('all', () => {
  const validator = new XyoBoundWitnessBodyValidator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
