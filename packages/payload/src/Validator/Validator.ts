import { XyoValidator, XyoValidatorBase } from '@xyo-network/core'

import { XyoPayload } from '../models'
import { XyoPayloadBodyValidator } from './BodyValidator'

export class XyoPayloadValidator<T extends XyoPayload = XyoPayload> extends XyoValidatorBase<T> implements XyoValidator<T> {
  public body: XyoPayloadBodyValidator
  constructor(payload: T) {
    super(payload)
    this.body = new XyoPayloadBodyValidator(payload)
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.body.validate())
    return errors
  }
}
