import { XyoBoundWitness } from '../../models'
import XyoBoundWitnessBodyValidator from './BodyValidator'
import XyoBoundWitnessMetaValidator from './MetaValidator'

class Validator {
  private bw: XyoBoundWitness
  public body: XyoBoundWitnessBodyValidator
  public meta: XyoBoundWitnessMetaValidator
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
    this.body = new XyoBoundWitnessBodyValidator(bw, bw._payloads)
    this.meta = new XyoBoundWitnessMetaValidator(bw)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export default Validator
