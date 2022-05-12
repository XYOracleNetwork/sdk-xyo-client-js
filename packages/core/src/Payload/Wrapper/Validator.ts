import { XyoPayload } from '../models'
import { XyoPayloadValidator } from '../Validator'
import { XyoPayloadWrapper } from './Wrapper'

export class XyoPayloadWrapperValidator<T extends XyoPayloadWrapper<XyoPayload> = XyoPayloadWrapper<XyoPayload>> {
  protected wrapper: T
  constructor(wrapper: T) {
    this.wrapper = wrapper
  }

  public get payload() {
    return new XyoPayloadValidator(this.wrapper.payload)
  }

  public all() {
    const errors: Error[] = []
    errors.push(...this.payload.all())
    return errors
  }
}
