import { dumpErrors } from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import { BodyValidator } from './BodyValidator'

test('all', () => {
  const validator = new BodyValidator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(3)
})
