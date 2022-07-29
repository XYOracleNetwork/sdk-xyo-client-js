import { XyoSimpleWitness } from '@xyo-network/witness'

import { XyoDomainPayload } from './DomainPayload'
import { domainConfigTemplate } from './Template'

const template = domainConfigTemplate()

export class XyoDomainWitness extends XyoSimpleWitness<XyoDomainPayload> {
  public static dmarc = '_xyo'

  constructor() {
    super({
      schema: template.schema,
      template,
    })
  }

  public static generateDmarc(domain: string) {
    return `${XyoDomainWitness.dmarc}.${domain}`
  }
}

/** @deprecated use XyoDomainWitness instead */
export class XyoDomainConfigWitness extends XyoDomainWitness {}
