import { dumpErrors } from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import { MetaValidator } from './MetaValidator'

test('all', () => {
  const validator = new MetaValidator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
