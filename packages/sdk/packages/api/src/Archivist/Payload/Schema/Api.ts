import { XyoApiSimple } from '../../../Simple'

export interface XyoArchivistArchivePayloadSchemaStats {
  counts: Record<string, number>
}

export class XyoArchivistArchivePayloadSchemaApi extends XyoApiSimple<string[]> {
  private _stats?: XyoApiSimple<XyoArchivistArchivePayloadSchemaStats>
  public get stats() {
    this._stats =
      this._stats ??
      new XyoApiSimple<XyoArchivistArchivePayloadSchemaStats>({
        ...this.config,
        root: `${this.root}stats/`,
      })
    return this._stats
  }
}
