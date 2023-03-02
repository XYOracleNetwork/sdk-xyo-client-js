import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveBlockApi } from '../Block'
import { XyoArchivistArchiveSettingsApi } from './Settings'

export class XyoArchivistArchiveApi extends XyoApiSimple<XyoArchive> {
  private _block?: XyoArchivistArchiveBlockApi
  private _settings?: XyoArchivistArchiveSettingsApi

  /**
   * @deprecated Use module API
   */
  get block(): XyoArchivistArchiveBlockApi {
    this._block =
      this._block ??
      new XyoArchivistArchiveBlockApi({
        ...this.config,
        root: `${this.root}block/`,
      })
    return this._block
  }

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
