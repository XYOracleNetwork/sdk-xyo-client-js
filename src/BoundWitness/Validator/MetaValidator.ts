import pick from 'lodash/pick'

import { XyoHasher } from '../../Hasher'
import { XyoBoundWitness } from '../../models'
import { isIP } from './is-ip'

const MIN_ALLOWED_TIMESTAMP = 1609459200000
const MAX_ALLOWED_TIMESTAMP = 4102444800000

export class XyoBoundWitnessMetaValidator {
  private bw: XyoBoundWitness
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
  }

  public client() {
    const errors: Error[] = []
    return errors
  }

  public hash() {
    const errors: Error[] = []
    const body = pick(this.bw, ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'])

    const bodyHash = new XyoHasher(body).sortedHash()
    if (bodyHash !== this.bw._hash)
      errors.push(new Error(`Body hash mismatch: [calculated: ${bodyHash}] [found: ${this.bw._hash}]`))
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
    const { _timestamp } = this.bw
    if (_timestamp === undefined) errors.push(new Error('Missing _timestamp'))
    else if (_timestamp < MIN_ALLOWED_TIMESTAMP) errors.push(new Error('_timestamp is before year 2021'))
    else if (_timestamp > MAX_ALLOWED_TIMESTAMP) errors.push(new Error('_timestamp is after year 2100'))
    return errors
  }

  public sourceIp() {
    const errors: Error[] = []
    const { _source_ip } = this.bw
    if (_source_ip && !isIP(_source_ip)) {
      errors.push(new Error(`_source_ip invalid format [${_source_ip}]`))
    }
    return errors
  }

  public userAgent() {
    const errors: Error[] = []
    const { _user_agent } = this.bw
    if (!_user_agent) errors.push(new Error('_user_agent missing'))
    return errors
  }

  public all() {
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
