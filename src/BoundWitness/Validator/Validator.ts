import { XyoBoundWitness } from '../../models'
import BodyValidator from './BodyValidator'
import MetaValidator from './MetaValidator'

class Validator {
  private bw: XyoBoundWitness
  public body: BodyValidator
  public meta: MetaValidator
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
    this.body = new BodyValidator(bw, bw._payloads)
    this.meta = new MetaValidator(bw)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export default Validator
