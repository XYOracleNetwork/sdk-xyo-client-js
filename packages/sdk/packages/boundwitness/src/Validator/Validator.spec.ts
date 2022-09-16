import { dumpErrors } from '@xyo-network/core'

import { testBoundWitness } from '../Test'
import { BoundWitnessValidator } from './Validator'

test('all', () => {
  const validator = new BoundWitnessValidator(testBoundWitness)
  const errors = validator.validate()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
