import pick from 'lodash/pick'
import { UAParser } from 'ua-parser-js'

import { XyoBoundWitness } from '../../models'
import sortedHash from '../../sortedHash'
import sortedStringify from '../../sortedStringify'
import { XyoBoundWitnessValidator } from '../Validator'

const scrubbedFields = [
  '_archive',
  '_client',
  '_hash',
  '_signatures',
  '_timestamp',
  '_user_agent',
  'addresses',
  'payload_schemas',
  'previous_hashes',
]

class Wrapper {
  public readonly bw: XyoBoundWitness
  constructor(bw: XyoBoundWitness) {
    this.bw = bw
  }

  get scrubbed() {
    return pick(this.bw, scrubbedFields)
  }

  private _validator?: XyoBoundWitnessValidator
  get validator() {
    this._validator = this._validator ?? new XyoBoundWitnessValidator(this.bw)
    return this._validator
  }

  private _userAgent?: UAParser
  get userAgent() {
    this._userAgent = this._userAgent ?? new UAParser(this.bw._user_agent)
    return this._userAgent
  }

  public sortedStringify() {
    return sortedStringify(this.bw)
  }

  public sortedHash() {
    return sortedHash(this.bw)
  }
}

export default Wrapper
