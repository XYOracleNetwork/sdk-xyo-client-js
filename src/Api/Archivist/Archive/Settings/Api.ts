import { XyoApiBase } from '../../../Base'
import { XyoArchivistArchiveSettingsKeyApi } from './Keys'

export class XyoArchivistArchiveSettingsApi extends XyoApiBase {
  private _key?: XyoArchivistArchiveSettingsKeyApi
  public get key(): XyoArchivistArchiveSettingsKeyApi {
    this._key =
      this._key ??
      new XyoArchivistArchiveSettingsKeyApi({
        ...this.config,
        root: `${this.root}key/`,
      })
    return this._key
  }
}
