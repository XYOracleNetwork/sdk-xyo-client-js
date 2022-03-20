import { XyoArchivistApiBase } from '../../Base'
import { ArchiveResponse, PutArchiveRequest } from '../../models'
import { XyoArchivistArchiveBlockApi } from '../Block'
import { XyoArchivistArchivePayloadApi } from '../Payload'
import { XyoArchivistArchiveSettingsApi } from '../Settings'

export class XyoArchivistArchiveApi extends XyoArchivistApiBase {
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

  public async get() {
    return await this.getEndpoint<{ archive: string }>()
  }

  public async put(data: PutArchiveRequest = { accessControl: false }) {
    return await this.putEndpoint<ArchiveResponse>('', data)
  }
}
