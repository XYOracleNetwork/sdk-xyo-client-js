import { dumpErrors } from '../../dumpErrors'
import { testBoundWitness } from '../../Test'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

test('all', () => {
  const validator = new XyoBoundWitnessMetaValidator(testBoundWitness)
  const errors = validator.all()
  dumpErrors(errors)
  expect(errors.length).toBe(0)
})
