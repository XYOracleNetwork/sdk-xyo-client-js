import pick from 'lodash/pick'
import { UAParser } from 'ua-parser-js'

import { XyoBoundWitness } from '../../models'
import XyoHasher from '../../XyoHasher'
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
  'payload_hashes',
]

class XyoBoundWitnessWrapper<T extends XyoBoundWitness> extends XyoHasher<T> {
  public readonly bw: T
  constructor(bw: T) {
    super(bw)
    this.bw = bw
  }

  get scrubbedFields() {
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
}

export default XyoBoundWitnessWrapper
