import { PayloadWrapper } from '@xyo-network/payload'

import { XyoBoundWitness } from '../models'
import { BoundWitnessValidator } from '../Validator'

export class BoundWitnessWrapper<T extends XyoBoundWitness = XyoBoundWitness> extends PayloadWrapper<T> {
  public get boundwitness() {
    return this.obj
  }

  override get errors() {
    return new BoundWitnessValidator(this.boundwitness).validate()
  }
}

/** @deprecated use BoundWitnessWrapper instead*/
export class XyoBoundWitnessWrapper<T extends XyoBoundWitness> extends BoundWitnessWrapper<T> {}
