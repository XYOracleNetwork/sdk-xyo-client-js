import { XyoDomainConfig } from '../../../DomainConfig'
import { XyoArchivistApiBase } from '../Base'

export class XyoArchivistDomainApi extends XyoArchivistApiBase {
  public async get(domain: string) {
    return await this.getEndpoint<XyoDomainConfig>(domain)
  }
}
