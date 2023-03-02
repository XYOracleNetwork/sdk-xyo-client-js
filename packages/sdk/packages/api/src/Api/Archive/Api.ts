import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveSettingsApi } from './Settings'

export class XyoArchivistArchiveApi extends XyoApiSimple<XyoArchive> {
  private _settings?: XyoArchivistArchiveSettingsApi

  get settings(): XyoArchivistArchiveSettingsApi {
    this._settings =
      this._settings ??
      new XyoArchivistArchiveSettingsApi({
        ...this.config,
        root: `${this.root}settings/`,
      })
    return this._settings
  }
}
