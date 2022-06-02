import { XyoLegacyWitness } from '@xyo-network/core'

import { XyoDomainPayload } from './DomainPayload'
import { domainConfigTemplate } from './Template'

const template = domainConfigTemplate()

export class XyoDomainConfigWitness extends XyoLegacyWitness<XyoDomainPayload> {
  public static demarc = '_xyo'

  constructor() {
    super({
      schema: template.schema,
      template,
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
