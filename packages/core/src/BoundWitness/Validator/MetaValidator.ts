import { XyoHasher } from '../../Hasher'
import { XyoValidator } from '../../lib'
import { XyoBoundWitnessMeta } from '../models'
import { isIP } from './is-ip'

const MIN_ALLOWED_TIMESTAMP = 1609459200000
const MAX_ALLOWED_TIMESTAMP = 4102444800000

export class XyoBoundWitnessMetaValidator<T extends XyoBoundWitnessMeta = XyoBoundWitnessMeta> extends XyoValidator<T> {
  public client() {
    const errors: Error[] = []
    return errors
  }

  public hash() {
    const errors: Error[] = []

    const hasher = new XyoHasher(this.obj)

    const bodyHash = hasher.hash
    if (bodyHash !== this.obj._hash) errors.push(new Error(`Body hash mismatch: [calculated: ${bodyHash}] [found: ${this.obj._hash}] [sortedStringify: ${hasher.stringified}]`))
    return errors
  }

  public payloads() {
    const errors: Error[] = []
    return errors
  }

  public signatures() {
    const errors: Error[] = []
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

  public sourceIp() {
    const errors: Error[] = []
    const { _source_ip } = this.obj
    if (_source_ip && !isIP(_source_ip)) {
      errors.push(new Error(`_source_ip invalid format [${_source_ip}]`))
    }
    return errors
  }

  public userAgent() {
    const errors: Error[] = []
    const { _user_agent } = this.obj
    if (!_user_agent) errors.push(new Error('_user_agent missing'))
    return errors
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.client(), ...this.hash(), ...this.payloads(), ...this.signatures())
    return errors
  }

  public meta() {
    const errors: Error[] = []
    errors.push(...this.timestamp(), ...this.sourceIp(), ...this.userAgent())
    return errors
  }
}
