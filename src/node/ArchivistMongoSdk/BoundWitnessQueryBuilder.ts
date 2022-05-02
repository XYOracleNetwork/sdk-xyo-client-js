import { Collection, SortDirection } from 'mongodb'

import { XyoBoundWitness } from '../../core'
import { XyoQueryBuilder } from './QueryBuilder'

export class XyoBoundWitnessQueryBuilder extends XyoQueryBuilder<XyoBoundWitness> {
  public build() {
    const _archive = this._archive
    const _timestamp = this._searchDirection === 'desc' ? { $lte: this._from } : { $gte: this._from }
    const sort: { _timestamp: SortDirection } =
      this._searchDirection === 'desc' ? { _timestamp: -1 } : { _timestamp: 1 }
    // NOTE: BW schema is always the same so we want to find BW's with payload_schemas equal to the supplied value
    const _schema = this._schema ? { payload_schemas: { $in: [this._schema] } } : { payload_schemas: { $exists: true } }
    const filter = { _archive, _schema, _timestamp }
    return this.useCollection((collection: Collection<XyoBoundWitness>) => {
      return collection.find(filter).sort(sort).limit(this._limit).maxTimeMS(this._maxTime)
    })
  }
}
