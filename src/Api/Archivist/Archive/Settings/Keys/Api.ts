import { XyoArchivistApiBase } from '../../../Base'
import { ArchiveKeyResponse } from '../../../models'

export class XyoArchivistArchiveSettingsKeysApi extends XyoArchivistApiBase {
  public async get() {
    return (
      await this.axios.get<ArchiveKeyResponse[]>(
        `${this.config.apiDomain}/archive/${this.config.archive}/settings/keys`,
        this.axiosRequestConfig
      )
    ).data
  }

  public async post() {
    return (
      await this.axios.post<ArchiveKeyResponse>(
        `${this.config.apiDomain}/archive/${this.config.archive}/settings/keys`,
        null,
        this.axiosRequestConfig
      )
    ).data
  }
}
