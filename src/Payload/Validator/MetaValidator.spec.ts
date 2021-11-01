import dumpErrors from '../../dumpErrors'
import { testPayload } from '../../Test'
import MetaValidator from './MetaValidator'

test('all', () => {
  const validator = new MetaValidator(testPayload)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
