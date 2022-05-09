import { XyoWitness } from '../core'
import { XyoDomainConfig } from './DomainConfig'

export class XyoDomainConfigWitness extends XyoWitness<XyoDomainConfig> {
  public static schema: XyoDomainConfig['schema'] = 'network.xyo.domain'
  public static demarc = '_xyo'

  constructor() {
    super({
      schema: XyoDomainConfigWitness.schema,
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
