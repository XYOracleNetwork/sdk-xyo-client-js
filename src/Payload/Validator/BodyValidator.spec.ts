import dumpErrors from '../../dumpErrors'
import { testPayload } from '../../Test'
import BodyValidator from './BodyValidator'

test('all', () => {
  const validator = new BodyValidator(testPayload)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(3)
})
