import { XyoSchemaCacheEntry } from '../../../SchemaCache'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistSchemaApi } from '../Schema'

export class XyoArchivistSchemasApi extends XyoApiSimple<XyoSchemaCacheEntry[]> {
  private _recent?: XyoApiSimple<XyoSchemaCacheEntry[]>
  public get recent(): XyoApiSimple<XyoSchemaCacheEntry[]> {
    this._recent =
      this._recent ??
      new XyoApiSimple<XyoSchemaCacheEntry[]>({
        ...this.config,
        root: `${this.root}recent/`,
      })
    return this._recent
  }

  public schema(schema = 'network.xyo.schema') {
    return new XyoArchivistSchemaApi({
      ...this.config,
      root: `${this.root}${schema}/`,
    })
  }
}
