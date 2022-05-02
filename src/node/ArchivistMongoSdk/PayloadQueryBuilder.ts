import { Collection, SortDirection } from 'mongodb'

import { XyoPayload } from '../../core'
import { XyoQueryBuilder } from './QueryBuilder'

export class XyoPayloadQueryBuilder extends XyoQueryBuilder<XyoPayload> {
  public build() {
    const _archive = this._archive
    const _timestamp = this._searchDirection === 'desc' ? { $lte: this._from } : { $gte: this._from }
    const sort: { _timestamp: SortDirection } =
      this._searchDirection === 'desc' ? { _timestamp: -1 } : { _timestamp: 1 }
    const _schema = this._schema ? { _schema: this._schema } : { _schema: { $exists: true } }
    const filter = { _archive, _schema, _timestamp }
    return this.useCollection((collection: Collection<XyoPayload>) => {
      return collection.find(filter).sort(sort).limit(this._limit).maxTimeMS(this._maxTime)
    })
  }
}
