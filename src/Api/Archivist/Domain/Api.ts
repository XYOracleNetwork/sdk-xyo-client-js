import { XyoDomainConfig } from '../../../DomainConfig'
import { XyoApiBase } from '../../Base'

export class XyoArchivistDomainApi extends XyoApiBase {
  public async get(domain: string) {
    return await this.getEndpoint<XyoDomainConfig>(domain)
  }
}
