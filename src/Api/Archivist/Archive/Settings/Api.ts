import { XyoApiBase } from '../../../Base'
import { XyoArchivistArchiveSettingsKeysApi } from './Keys'

export class XyoArchivistArchiveSettingsApi extends XyoApiBase {
  private _keys?: XyoArchivistArchiveSettingsKeysApi
  public get keys(): XyoArchivistArchiveSettingsKeysApi {
    this._keys =
      this._keys ??
      new XyoArchivistArchiveSettingsKeysApi({
        ...this.config,
        root: `${this.root}keys/`,
      })
    return this._keys
  }
}
