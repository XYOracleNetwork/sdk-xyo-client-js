import { dumpErrors } from '../../../lib'
import { testPayload } from '../../../Test'
import { XyoPayloadBodyValidator } from './BodyValidator'

test('all', () => {
  const validator = new XyoPayloadBodyValidator(testPayload)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
