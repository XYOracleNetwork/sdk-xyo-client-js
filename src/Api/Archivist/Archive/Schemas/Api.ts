import { XyoFetchedPayload } from '../../../../core'
import { XyoSchemaPayload } from '../../../../Witnesses'
import { XyoApiSimple } from '../../../Simple'

export class XyoArchivistArchiveSchemasApi extends XyoApiSimple<XyoFetchedPayload<XyoSchemaPayload>[]> {
  private _recent?: XyoApiSimple<XyoFetchedPayload<XyoSchemaPayload>[]>
  public get recent(): XyoApiSimple<XyoFetchedPayload<XyoSchemaPayload>[]> {
    this._recent =
      this._recent ??
      new XyoApiSimple<XyoFetchedPayload<XyoSchemaPayload>[]>({
        ...this.config,
        root: `${this.root}recent/`,
      })
    return this._recent
  }
}
