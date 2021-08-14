import { XyoBoundWitness } from '../../models'
import XyoBoundWitnessBodyValidator from './BodyValidator'
import XyoBoundWitnessMetaValidator from './MetaValidator'

class Validator {
  public body: XyoBoundWitnessBodyValidator
  public meta: XyoBoundWitnessMetaValidator
  constructor(bw: XyoBoundWitness) {
    this.body = new XyoBoundWitnessBodyValidator(bw)
    this.meta = new XyoBoundWitnessMetaValidator(bw)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export default Validator
