import { deepOmitUnderscoreFields, deepPickUnderscoreFields, XyoHasher } from '../../Hasher'
import { Huri } from '../../Huri'
import { XyoPayload } from '../../models'
import { XyoDataLike } from '../../Wallet'

export class XyoPayloadWrapper<T extends XyoPayload> extends XyoHasher<T> {
  public get payload() {
    return this.obj
  }

  public get body() {
    return deepOmitUnderscoreFields<T>(this.obj)
  }

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
