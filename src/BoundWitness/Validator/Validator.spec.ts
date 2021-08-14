import { testBoundWitness } from '../../Test'
import Validator from './Validator'

test('all', () => {
  const validator = new Validator(testBoundWitness)

  const errors = validator.all()
  expect(errors.length).toBe(0)
})
