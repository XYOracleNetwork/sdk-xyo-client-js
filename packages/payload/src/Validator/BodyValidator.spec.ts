import { dumpErrors } from '@xyo-network/core'

import { testPayload } from '../Test'
import { XyoPayloadBodyValidator } from './BodyValidator'

test('all', () => {
  const validator = new XyoPayloadBodyValidator(testPayload)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
