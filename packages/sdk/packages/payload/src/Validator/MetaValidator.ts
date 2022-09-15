/* eslint-disable deprecation/deprecation */
/* eslint-disable import/no-deprecated */
import { Hasher, XyoValidatorBase } from '@xyo-network/core'

import { XyoPayloadMeta } from '../models'

const MIN_ALLOWED_TIMESTAMP = 1609459200000
const MAX_ALLOWED_TIMESTAMP = 4102444800000

/** @deprecated - meta fields not supported by client anymore */
class XyoPayloadMetaValidator<T extends XyoPayloadMeta = XyoPayloadMeta> extends XyoValidatorBase<T> {
  public hash() {
    const errors: Error[] = []
    const wrapper = new Hasher(this.obj)

    const bodyHash = wrapper.hash
    if (bodyHash !== this.obj._hash) errors.push(new Error(`Body hash mismatch: [calculated: ${bodyHash}] [found: ${this.obj._hash}]`))
    return errors
  }

  public timestamp() {
    const errors: Error[] = []
    const { _timestamp } = this.obj
    if (_timestamp === undefined) errors.push(new Error('Missing _timestamp'))
    else if (_timestamp < MIN_ALLOWED_TIMESTAMP) errors.push(new Error('_timestamp is before year 2021'))
    else if (_timestamp > MAX_ALLOWED_TIMESTAMP) errors.push(new Error('_timestamp is after year 2100'))
    return errors
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.hash(), ...this.timestamp())
    return errors
  }
}

export { XyoPayloadMetaValidator }
