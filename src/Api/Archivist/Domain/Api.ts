import { XyoDomainConfig } from '../../../DomainConfig'
import { XyoApiBase } from '../../Base'
import { XyoApiSimple } from '../../Simple'

export class XyoArchivistDomainApi extends XyoApiBase {
  public domain(domain: string): XyoApiSimple<XyoDomainConfig> {
    return new XyoApiSimple<XyoDomainConfig>({
      ...this.config,
      root: `${this.root}domain/${domain}/`,
    })
  }

  /** @deprecated use domain(domain) instead */
  public async get(domain: string) {
    return await this.getEndpoint<XyoDomainConfig>(domain)
  }
}
