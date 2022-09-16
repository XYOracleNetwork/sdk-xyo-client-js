import { Hasher } from '@xyo-network/core'
import pick from 'lodash/pick'

import { XyoBoundWitness } from '../models'

const scrubbedFields = ['_signatures', 'addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes', 'schema', 'timestamp']

export class XyoBoundWitnessWrapper<T extends XyoBoundWitness> extends Hasher<T> {
  public readonly bw: T
  constructor(bw: T) {
    super(bw)
    this.bw = bw
  }

  get scrubbedFields() {
    return pick(this.bw, scrubbedFields)
  }
}
