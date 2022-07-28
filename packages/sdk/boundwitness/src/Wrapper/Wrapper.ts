import { XyoHasher } from '@xyo-network/core'
import pick from 'lodash/pick'
import { UAParser } from 'ua-parser-js'

import { XyoBoundWitness, XyoBoundWitnessWithMeta } from '../models'

const scrubbedFields = ['_archive', '_client', '_hash', '_signatures', '_timestamp', '_user_agent', 'addresses', 'payload_schemas', 'previous_hashes', 'payload_hashes', 'schema']

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
