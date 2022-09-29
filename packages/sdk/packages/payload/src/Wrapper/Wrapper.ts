import { assertEx } from '@xylabs/assert'
import { deepOmitUnderscoreFields, Hasher, XyoDataLike } from '@xyo-network/core'
import { Promisable } from '@xyo-network/promise'

import { Huri } from '../Huri'
import { XyoPayload } from '../models'
import { PayloadValidator } from '../Validator'

export abstract class PayloadWrapperBase<TPayload extends XyoPayload = XyoPayload> extends Hasher<TPayload> {
  public get payload() {
    return this.obj
  }

  //intentionally not naming this 'schema' so that the wrapper is not confused for a XyoPayload
  public get schemaName() {
    return this.obj.schema
  }

  public get body() {
    return deepOmitUnderscoreFields<TPayload>(this.obj)
  }

  get valid() {
    return this.errors.length === 0
  }

  get errors() {
    return new PayloadValidator(this.payload).validate()
  }

  public static load(_address: XyoDataLike | Huri): Promisable<PayloadWrapperBase | null> {
    throw Error('Not implemented')
  }

  public static parse(_obj: unknown): PayloadWrapperBase {
    throw Error('Not implemented')
  }
}

export class PayloadWrapper<TPayload extends XyoPayload = XyoPayload> extends PayloadWrapperBase<TPayload> {
  private isPayloadWrapper = true

  public static override async load(address: XyoDataLike | Huri) {
    const payload = await new Huri(address).fetch()
    return payload ? new PayloadWrapper(payload) : null
  }

  public static override parse<T extends XyoPayload = XyoPayload>(obj: unknown): PayloadWrapper<T> {
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
export class XyoPayloadWrapper<T extends XyoPayload = XyoPayload> extends PayloadWrapperBase<T> {}
