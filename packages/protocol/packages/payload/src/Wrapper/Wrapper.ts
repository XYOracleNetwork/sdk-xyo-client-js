import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, Hasher } from '@xyo-network/core'
import { Promisable } from '@xyo-network/promise'

import { Huri } from '../Huri'
import { XyoPayload } from '../models'
import { PayloadValidator } from '../Validator'

export abstract class PayloadWrapperBase<TPayload extends XyoPayload = XyoPayload> extends Hasher<TPayload> {
  public get body() {
    return deepOmitUnderscoreFields<TPayload>(this.obj)
  }

  get errors() {
    return new PayloadValidator(this.payload).validate()
  }

  public get payload() {
    return assertEx(this.obj, 'Missing payload object')
  }

  public get previousHash() {
    return null
  }

  public get schema() {
    return this.payload.schema
  }

  //intentionally not naming this 'schema' so that the wrapper is not confused for a XyoPayload
  public get schemaName() {
    return assertEx(this.obj.schema, 'Missing payload schema')
  }

  get valid() {
    return this.errors.length === 0
  }

  public static load(_address: DataLike | Huri): Promisable<PayloadWrapperBase | null> {
    throw Error('Not implemented')
  }

  public static parse(_obj: unknown): PayloadWrapperBase {
    throw Error('Not implemented')
  }
}

export class PayloadWrapper<TPayload extends XyoPayload = XyoPayload> extends PayloadWrapperBase<TPayload> {
  private isPayloadWrapper = true

  public static override async load(address: DataLike | Huri) {
    const payload = await new Huri(address).fetch()
    return payload ? new PayloadWrapper(payload) : null
  }

  public static override parse<T extends XyoPayload = XyoPayload>(obj: unknown): PayloadWrapper<T> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to PayloadWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as PayloadWrapper<T>
        return assertEx(
          castWrapper?.isPayloadWrapper ? castWrapper : (obj as XyoPayload).schema ? new PayloadWrapper(obj as T) : null,
          'Unable to parse payload object',
        )
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }
}
