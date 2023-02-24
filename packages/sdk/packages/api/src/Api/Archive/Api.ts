import { XyoArchive } from '../../models'
import { XyoApiSimple } from '../../Simple'
import { XyoArchivistArchiveBlockApi } from '../Block'
import { XyoArchivistPayloadApi } from '../Payload'
import { XyoArchivistArchiveSchemaApi } from './Schema'
import { XyoArchivistArchiveSchemasApi } from './Schemas'
import { XyoArchivistArchiveSettingsApi } from './Settings'

export class XyoArchivistArchiveApi extends XyoApiSimple<XyoArchive> {
  private _block?: XyoArchivistArchiveBlockApi
  private _payload?: XyoArchivistPayloadApi
  private _schemas?: XyoArchivistArchiveSchemasApi
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

  /**
   * @deprecated Use module API
   */
  get payload(): XyoArchivistPayloadApi {
    this._payload =
      this._payload ??
      new XyoArchivistPayloadApi({
        ...this.config,
        root: `${this.root}payload/`,
      })
    return this._payload
  }

  /**
   * @deprecated Use module API
   */
  get schemas(): XyoArchivistArchiveSchemasApi {
    this._schemas =
      this._schemas ??
      new XyoArchivistArchiveSchemasApi({
        ...this.config,
        root: `${this.root}schema/`,
      })
    return this._schemas
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

  /**
   * @deprecated Use module API
   */
  schema(schema: string): XyoArchivistArchiveSchemaApi {
    return new XyoArchivistArchiveSchemaApi({
      ...this.config,
      root: `${this.root}schema/${schema}/`,
    })
  }
}
