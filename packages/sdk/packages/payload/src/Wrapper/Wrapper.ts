import { assertEx } from '@xylabs/assert'
import { deepOmitUnderscoreFields, Hasher, XyoDataLike } from '@xyo-network/core'

import { Huri } from '../Huri'
import { XyoPayload } from '../models'
import { PayloadValidator } from '../Validator'

export class PayloadWrapper<T extends XyoPayload = XyoPayload> extends Hasher<T> {
  private isPayloadWrapper = true

  public get payload() {
    return this.obj
  }

  //intentionally not naming this 'schema' so that the wrapper is not confused for a XyoPayload
  public get schemaName() {
    return this.obj.schema
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

  public static async load(address: XyoDataLike | Huri) {
    const payload = await new Huri(address).fetch()
    if (payload) {
      return new PayloadWrapper(payload)
    }
  }

  public static parse<T extends XyoPayload = XyoPayload>(obj: unknown): PayloadWrapper<T> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to PayloadWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as PayloadWrapper<T>
        return castWrapper?.isPayloadWrapper ? castWrapper : new PayloadWrapper(obj as T)
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }
}

/** @deprecated use PayloadWrapper instead */
export class XyoPayloadWrapper<T extends XyoPayload = XyoPayload> extends PayloadWrapper<T> {}
