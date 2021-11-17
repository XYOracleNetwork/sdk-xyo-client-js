import { XyoBoundWitness } from '../../models'
import { XyoBoundWItnessBodyValidator } from './BodyValidator'
import { XyoBoundWItnessMetaValidator } from './MetaValidator'

class XyoBoundWitnessValidator {
  private bw: XyoBoundWitness
  public body: XyoBoundWItnessBodyValidator
  public meta: XyoBoundWItnessMetaValidator
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
    this.body = new XyoBoundWItnessBodyValidator(bw, bw._payloads)
    this.meta = new XyoBoundWItnessMetaValidator(bw)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    return errors
  }
}

export { XyoBoundWitnessValidator }
