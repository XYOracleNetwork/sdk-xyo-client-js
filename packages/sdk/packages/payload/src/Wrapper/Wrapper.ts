import { deepOmitUnderscoreFields, deepPickUnderscoreFields, Hasher, XyoDataLike } from '@xyo-network/core'

import { Huri } from '../Huri'
import { XyoPayload } from '../models'
import { PayloadValidator } from '../Validator'

export class PayloadWrapper<T extends XyoPayload = XyoPayload> extends Hasher<T> {
  public get payload() {
    return this.obj
  }

  public get body() {
    return deepOmitUnderscoreFields<T>(this.obj)
  }

  get valid() {
    return this.errors.length === 0
  }

  get errors() {
    return new PayloadValidator(this.payload).validate()
  }

  /** @deprecated - meta fields not supported by client anymore */
  public get meta() {
    return deepPickUnderscoreFields<T>(this.obj)
  }

  public static async load(address: XyoDataLike | Huri) {
    const payload = await new Huri(address).fetch()
    if (payload) {
      return new PayloadWrapper(payload)
    }
  }
}

/** @deprecated use PayloadWrapper instead */
export class XyoPayloadWrapper<T extends XyoPayload = XyoPayload> extends PayloadWrapper<T> {}
