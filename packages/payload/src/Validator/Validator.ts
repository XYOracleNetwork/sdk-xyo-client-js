import { XyoValidator } from '@xyo-network/core'

import { XyoPayloadWithMeta } from '../models'
import { XyoPayloadBodyValidator } from './BodyValidator'
import { XyoPayloadMetaValidator } from './MetaValidator'

export class XyoPayloadValidator<T extends XyoPayloadWithMeta = XyoPayloadWithMeta> extends XyoValidator<T> {
  public body: XyoPayloadBodyValidator
  public meta: XyoPayloadMetaValidator
  constructor(payload: T) {
    super(payload)
    this.body = new XyoPayloadBodyValidator(payload)
    this.meta = new XyoPayloadMetaValidator(payload)
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.body.validate())
    return errors
  }
}
