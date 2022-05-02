import { Filter } from 'mongodb'

import { XyoPayload } from '../../core'
import { XyoQueryBuilder } from './QueryBuilder'

export class XyoPayloadQueryBuilder extends XyoQueryBuilder<XyoPayload> {
  protected get filter(): Filter<XyoPayload> {
    const _schema = this._schema ? { _schema: this._schema } : { _schema: { $exists: true } }
    return { _archive: this.archive, _schema, _timestamp: this.timestampFilter }
  }
}
