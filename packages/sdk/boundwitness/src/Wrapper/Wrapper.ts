import { XyoHasher } from '@xyo-network/core'
import pick from 'lodash/pick'
import { UAParser } from 'ua-parser-js'

import { XyoBoundWitness, XyoBoundWitnessWithMeta } from '../models'

const scrubbedFields = ['_signatures', 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes', 'schema', 'timestamp']

export class XyoBoundWitnessWrapper<T extends XyoBoundWitness> extends XyoHasher<T> {
  public readonly bw: T
  constructor(bw: T) {
    super(bw)
    this.bw = bw
  }

  get scrubbedFields() {
    return pick(this.bw, scrubbedFields)
  }
}

export class XyoBoundWitnessWithMetaWrapper<T extends XyoBoundWitnessWithMeta> extends XyoBoundWitnessWrapper<T> {
  private _userAgent?: UAParser
  get userAgent() {
    this._userAgent = this._userAgent ?? new UAParser(this.bw._user_agent)
    return this._userAgent
  }
}
