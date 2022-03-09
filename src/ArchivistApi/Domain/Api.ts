import { XyoDomainConfig } from '../../DomainConfig'
import { XyoArchivistApiBase } from '../Base'

export class XyoArchivistDomainApi extends XyoArchivistApiBase {
  public async get(domain: string) {
    return (await this.axios.get<XyoDomainConfig>(`${this.config.apiDomain}/domain/${domain}`, this.axiosRequestConfig))
      .data
  }
}
