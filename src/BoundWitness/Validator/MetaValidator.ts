import isIp from 'is-ip'
import pick from 'lodash/pick'

import { XyoBoundWitness } from '../../models'
import { XyoBoundWitnessBuilder } from '../Builder'

const MIN_ALLOWED_TIMESTAMP = 1609459200000
const MAX_ALLOWED_TIMESTAMP = 4102444800000

class MetaValidator {
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

    const bodyHash = XyoBoundWitnessBuilder.hash(body)
    if (bodyHash !== this.bw._hash)
      errors.push(Error(`Body hash mismatch: [calculated: ${bodyHash}] [found: ${this.bw._hash}]`))
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
    if (_timestamp === undefined) errors.push(Error('Missing _timestamp'))
    else if (_timestamp < MIN_ALLOWED_TIMESTAMP) errors.push(Error('_timestamp is before year 2021'))
    else if (_timestamp > MAX_ALLOWED_TIMESTAMP) errors.push(Error('_timestamp is after year 2100'))
    return errors
  }

  public sourceIp() {
    const errors: Error[] = []
    const { _source_ip } = this.bw
    if (!_source_ip) errors.push(Error('_source_ip missing'))
    else if (!isIp(_source_ip)) errors.push(Error(`_source_ip invalid format [${_source_ip}]`))
    return errors
  }

  public userAgent() {
    const errors: Error[] = []
    const { _user_agent } = this.bw
    if (!_user_agent) errors.push(Error('_user_agent missing'))
    return errors
  }

  public all() {
    const errors: Error[] = []
    errors.push(
      ...this.client(),
      ...this.hash(),
      ...this.payloads(),
      ...this.signatures(),
      ...this.timestamp(),
      ...this.sourceIp(),
      ...this.userAgent()
    )
    return errors
  }
}

export default MetaValidator
