import { assertEx } from '@xylabs/sdk-js'

import { XyoAddress } from '../../Address'
import { XyoBoundWitness } from '../models'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length != b.length ? [Error(`${message} []`)] : []
}

const validateSignature = (hash: string, address: string, signature?: string) => {
  if (!signature) {
    return [Error(`Missing signature [${address}]`)]
  }
  if (!XyoAddress.verifyAddress(hash, signature, address)) {
    return [Error(`Invalid signature [${address}]`)]
  }
  return []
}

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
    const hash = assertEx(this.bw._hash, 'Missing _hash')
    return [
      ...validateArraysSameLength(this.bw._signatures ?? [], this.bw.addresses, 'Length mismatch: address/_signature'),
      ...this.bw.addresses.reduce<Error[]>((errors, address, index) => {
        errors.push(...validateSignature(hash, address, this.bw._signatures?.[index]))
        return errors
      }, []),
    ]
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.meta.all(), ...this.body.all())
    errors.push(...this.signatures())
    return errors
  }
}

export { XyoBoundWitnessValidator }
