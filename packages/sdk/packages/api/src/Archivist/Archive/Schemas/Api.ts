import { XyoSchemaPayload } from '@xyo-network/schema-payload-plugin'

import { XyoApiSimple } from '../../../Simple'

export class XyoArchivistArchiveSchemasApi extends XyoApiSimple<XyoSchemaPayload[]> {
  private _recent?: XyoApiSimple<XyoSchemaPayload[]>
  public get recent(): XyoApiSimple<XyoSchemaPayload[]> {
    this._recent =
      this._recent ??
      new XyoApiSimple<XyoSchemaPayload[]>({
        ...this.config,
        root: `${this.root}recent/`,
      })
    return this._recent
  }
}
