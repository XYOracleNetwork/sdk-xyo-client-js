import { XyoBoundWitness } from '../../models'
import { XyoBoundWitnessValidator } from '../Validator'

class Wrapper {
  public readonly bw: XyoBoundWitness
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
  }

  private _validator?: XyoBoundWitnessValidator
  get validator() {
    this._validator = this._validator ?? new XyoBoundWitnessValidator(this.bw)
    return this._validator
  }
}

export default Wrapper
