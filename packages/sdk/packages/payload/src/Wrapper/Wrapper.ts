import { deepOmitUnderscoreFields, deepPickUnderscoreFields, Hasher, XyoDataLike } from '@xyo-network/core'

import { Huri } from '../Huri'
import { XyoPayload } from '../models'

export class XyoPayloadWrapper<T extends XyoPayload = XyoPayload> extends Hasher<T> {
  public get payload() {
    return this.obj
  }

  public get body() {
    return deepOmitUnderscoreFields<T>(this.obj)
  }

  /** @deprecated - meta fields not supported by client anymore */
  public get meta() {
    return deepPickUnderscoreFields<T>(this.obj)
  }

  public static async load(address: XyoDataLike | Huri) {
    const payload = await new Huri(address).fetch()
    if (payload) {
      return new XyoPayloadWrapper(payload)
    }
  }
}
