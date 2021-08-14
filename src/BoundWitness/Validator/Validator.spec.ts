import dumpErrors from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import Validator from './Validator'

test('all', () => {
  const validator = new Validator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(3)
})
