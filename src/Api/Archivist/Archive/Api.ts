import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveBlockApi } from '../Block'
import { XyoArchivistArchivePayloadApi } from '../Payload'
import { XyoArchivistArchiveSchemaApi } from './Schema'
import { XyoArchivistArchiveSettingsApi } from './Settings'

export class XyoArchivistArchiveApi extends XyoApiSimple<XyoArchive> {
  private _block?: XyoArchivistArchiveBlockApi
  public get block(): XyoArchivistArchiveBlockApi {
    this._block =
      this._block ??
      new XyoArchivistArchiveBlockApi({
        ...this.config,
        root: `${this.root}block/`,
      })
    return this._block
  }

  private _payload?: XyoArchivistArchivePayloadApi
  public get payload(): XyoArchivistArchivePayloadApi {
    this._payload =
      this._payload ??
      new XyoArchivistArchivePayloadApi({
        ...this.config,
        root: `${this.root}payload/`,
      })
    return this._payload
  }

  private _settings?: XyoArchivistArchiveSettingsApi
  public get settings(): XyoArchivistArchiveSettingsApi {
    this._settings =
      this._settings ??
      new XyoArchivistArchiveSettingsApi({
        ...this.config,
        root: `${this.root}settings/`,
      })
    return this._settings
  }

  private _schema?: XyoArchivistArchiveSchemaApi
  public get schema(): XyoArchivistArchiveSchemaApi {
    this._schema =
      this._schema ??
      new XyoArchivistArchiveSchemaApi({
        ...this.config,
        root: `${this.root}schema/`,
      })
    return this._schema
  }
}
