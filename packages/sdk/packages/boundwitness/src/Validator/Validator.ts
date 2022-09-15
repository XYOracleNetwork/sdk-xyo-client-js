import { XyoAddressValue } from '@xyo-network/account'
import { Hasher, XyoValidatorBase } from '@xyo-network/core'

import { XyoBoundWitnessWithPartialMeta } from '../models'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length != b.length ? [Error(`${message} []`)] : []
}

class XyoBoundWitnessValidator<T extends XyoBoundWitnessWithPartialMeta = XyoBoundWitnessWithPartialMeta> extends XyoValidatorBase<T> {
  public body: XyoBoundWitnessBodyValidator
  public meta: XyoBoundWitnessMetaValidator
  constructor(bw: T) {
    super(bw)
    this.body = new XyoBoundWitnessBodyValidator(bw, bw._payloads)
    this.meta = new XyoBoundWitnessMetaValidator(bw)
  }

  public get hash() {
    return new Hasher(this.obj).hash
  }

  public signatures() {
    return [
      ...validateArraysSameLength(this.obj._signatures ?? [], this.obj.addresses, 'Length mismatch: address/_signature'),
      ...this.obj.addresses.reduce<Error[]>((errors, address, index) => {
        errors.push(...XyoBoundWitnessValidator.validateSignature(this.hash, address, this.obj._signatures?.[index]))
        return errors
      }, []),
    ]
  }

  public validate() {
    return [...this.body.validate(), ...this.signatures()]
  }

  static validateSignature(hash: string, address: string, signature?: string) {
    if (!signature) {
      return [Error(`Missing signature [${address}]`)]
    }
    if (!new XyoAddressValue(address).verify(hash, signature)) {
      return [Error(`Invalid signature [${address}] [${signature}]`)]
    }
    return []
  }
}

export { XyoBoundWitnessValidator }
