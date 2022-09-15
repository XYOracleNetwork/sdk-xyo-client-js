import { XyoValidatorBase } from '@xyo-network/core'

import { XyoPayload } from '../models'
import { XyoPayloadValidator } from '../Validator'
import { XyoPayloadWrapper } from './Wrapper'

export class XyoPayloadWrapperValidator<T extends XyoPayloadWrapper<XyoPayload> = XyoPayloadWrapper<XyoPayload>> extends XyoValidatorBase<T> {
  public get payload() {
    return new XyoPayloadValidator(this.obj.body)
  }

  public validate() {
    const errors: Error[] = []
    errors.push(...this.payload.validate())
    return errors
  }
}
