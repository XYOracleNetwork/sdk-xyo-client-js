import { XyoArchivistApiBase } from '../Base'
import { ArchiveResponse, PutArchiveRequest } from '../models'
import { XyoArchivistArchiveBlockApi } from './Block'
import { XyoArchivistArchivePayloadApi } from './Payload'
import { XyoArchivistArchiveSettingsApi } from './Settings'

export class XyoArchivistArchiveApi extends XyoArchivistApiBase {
  private _block?: XyoArchivistArchiveBlockApi
  public get block(): XyoArchivistArchiveBlockApi {
    this._block = this._block ?? new XyoArchivistArchiveBlockApi(this.config)
    return this._block
  }

  private _payload?: XyoArchivistArchivePayloadApi
  public get payload(): XyoArchivistArchivePayloadApi {
    this._payload = this._payload ?? new XyoArchivistArchivePayloadApi(this.config)
    return this._payload
  }

  private _settings?: XyoArchivistArchiveSettingsApi
  public get settings(): XyoArchivistArchiveSettingsApi {
    this._settings = this._settings ?? new XyoArchivistArchiveSettingsApi(this.config)
    return this._settings
  }

  public async get(archive?: string) {
    if (archive) {
      return [
        (await this.axios.get<ArchiveResponse>(`${this.config.apiDomain}/archive/${archive}`, this.axiosRequestConfig))
          .data,
      ]
    }
    return (await this.axios.get<ArchiveResponse[]>(`${this.config.apiDomain}/archive`, this.axiosRequestConfig)).data
  }

  public async put(archive: string, data: PutArchiveRequest = { accessControl: false }) {
    return (
      await this.axios.put<ArchiveResponse>(
        `${this.config.apiDomain}/archive/${archive}`,
        data,
        this.axiosRequestConfig
      )
    ).data
  }
}
