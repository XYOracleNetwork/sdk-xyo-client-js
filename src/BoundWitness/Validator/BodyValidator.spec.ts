import { testBoundWitness } from '../../Test'
import BodyValidator from './BodyValidator'

test('all', () => {
  const validator = new BodyValidator(testBoundWitness)

  const errors = validator.all()
  expect(errors.length).toBe(0)
})
