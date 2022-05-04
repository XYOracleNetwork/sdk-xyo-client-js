import { XyoSchemaCacheEntry } from '../../../../SchemaCache'
import { XyoApiSimple } from '../../../Simple'

export class XyoArchivistArchiveSchemasApi extends XyoApiSimple<XyoSchemaCacheEntry[]> {
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
}
