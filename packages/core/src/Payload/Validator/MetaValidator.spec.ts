import { dumpErrors } from '../../lib'
import { testPayload } from '../../Test'
import { XyoPayloadMetaValidator } from './MetaValidator'

test('all', () => {
  const validator = new XyoPayloadMetaValidator(testPayload)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
