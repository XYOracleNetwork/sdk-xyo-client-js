import { XyoAddress } from '../../Address'
import { XyoBoundWitness } from '../../models'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

class XyoBoundWitnessValidator {
  private bw: XyoBoundWitness
  public body: XyoBoundWitnessBodyValidator
  public meta: XyoBoundWitnessMetaValidator
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
    this.body = new XyoBoundWitnessBodyValidator(bw, bw._payloads)
    this.meta = new XyoBoundWitnessMetaValidator(bw)
  }

  public signatures() {
    const errors: Error[] = []
    if (this.bw._signatures?.length !== this.bw.addresses.length) {
      errors.push(
        new Error(`Length mismatch: address/_signature [${(this.bw.addresses.length, this.bw._signatures?.length)}]`)
      )
    } else if (this.bw._hash) {
      for (let i = 1; i < this.bw.addresses.length; i++) {
        const signature = this.bw._signatures?.[i]
        const address = this.bw.addresses[i]
        console.log(`${i}sig: ${signature}`)
        console.log(`${i}add: ${address}`)
        if (signature) {
          if (!XyoAddress.verifyAddress(this.bw._hash, signature, address)) {
            new Error(`Invalid signature [${i}]`)
          }
        } else {
          new Error(`Missing signature [${i}]`)
        }
      }
    }
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    errors.push(...this.signatures())
    return errors
  }
}

export { XyoBoundWitnessValidator }
