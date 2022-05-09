import { XyoWitness } from '../core'
import { XyoDomainConfig } from './DomainConfig'
import { domainConfigTemplate } from './Template'

export class XyoDomainConfigWitness extends XyoWitness<XyoDomainConfig> {
  public static demarc = '_xyo'

  constructor() {
    super({
      schema: 'network.xyo.domain',
      template: domainConfigTemplate,
    })
  }

  public static generateDemarc(domain: string) {
    return `${XyoDomainConfigWitness.demarc}.${domain}`
  }

  /** @deprecate use generateDemarc instead */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static generateDemark(domain: string) {
    return
  }
}
