import { Filter } from 'mongodb'

import { XyoBoundWitness } from '../../core'
import { XyoQueryBuilder } from './QueryBuilder'

export class XyoBoundWitnessQueryBuilder extends XyoQueryBuilder<XyoBoundWitness> {
  protected get filter(): Filter<XyoBoundWitness> {
    // NOTE: BW schema is always the same so we want to find BW's with payload_schemas equal to the supplied value
    const _schema = this._schema ? { payload_schemas: { $in: [this._schema] } } : { payload_schemas: { $exists: true } }
    return { _archive: this._archive, _schema, _timestamp: this.timestampFilter }
  }
}
