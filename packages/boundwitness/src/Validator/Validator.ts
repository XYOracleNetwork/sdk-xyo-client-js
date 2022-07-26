import { assertEx } from '@xylabs/sdk-js'
import { XyoAddressValue } from '@xyo-network/account'
import { XyoValidatorBase } from '@xyo-network/core'

import { XyoBoundWitnessWithPartialMeta } from '../models'
import { XyoBoundWitnessBodyValidator } from './BodyValidator'
import { XyoBoundWitnessMetaValidator } from './MetaValidator'

const validateArraysSameLength = (a: unknown[], b: unknown[], message = 'Array length mismatch') => {
  return a.length != b.length ? [Error(`${message} []`)] : []
}

const validateSignature = (hash: string, address: string, signature?: string) => {
  if (!signature) {
    return [Error(`Missing signature [${address}]`)]
  }
  if (!new XyoAddressValue(address).verify(hash, signature)) {
    return [Error(`Invalid signature [${address}] [${signature}]`)]
  }
  return []
}

class XyoBoundWitnessValidator<T extends XyoBoundWitnessWithPartialMeta = XyoBoundWitnessWithPartialMeta> extends XyoValidatorBase<T> {
  public body: XyoBoundWitnessBodyValidator
  public meta: XyoBoundWitnessMetaValidator
  constructor(bw: T) {
    super(bw)
    this.body = new XyoBoundWitnessBodyValidator(bw, bw._payloads)
    this.meta = new XyoBoundWitnessMetaValidator(bw)
  }

  public signatures() {
    const hash = assertEx(this.obj._hash, 'Missing _hash')
    return [
      ...validateArraysSameLength(this.obj._signatures ?? [], this.obj.addresses, 'Length mismatch: address/_signature'),
      ...this.obj.addresses.reduce<Error[]>((errors, address, index) => {
        errors.push(...validateSignature(hash, address, this.obj._signatures?.[index]))
        return errors
      }, []),
    ]
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.meta.validate(), ...this.body.validate())
    errors.push(...this.signatures())
    return errors
  }
}

export { XyoBoundWitnessValidator }
