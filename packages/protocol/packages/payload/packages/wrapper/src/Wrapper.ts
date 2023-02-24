import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, Hasher } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { Promisable } from '@xyo-network/promise'

export type PayloadLoader = (address: DataLike) => Promise<XyoPayload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export abstract class PayloadWrapperBase<TPayload extends XyoPayload = XyoPayload> extends Hasher<TPayload> {
  get body() {
    return deepOmitUnderscoreFields<TPayload>(this.obj)
  }

  get errors() {
    return new PayloadValidator(this.payload).validate()
  }

  get payload() {
    return assertEx(this.obj, 'Missing payload object')
  }

  get schema() {
    return this.payload.schema
  }

  //intentionally not naming this 'schema' so that the wrapper is not confused for a XyoPayload
  get schemaName() {
    return assertEx(this.obj.schema, 'Missing payload schema')
  }

  get valid() {
    return this.errors.length === 0
  }

  static load(_address: DataLike): Promisable<PayloadWrapperBase | null> {
    throw Error('Not implemented')
  }

  static parse(_obj: unknown): PayloadWrapperBase {
    throw Error('Not implemented')
  }

  static tryParse(obj: unknown) {
    try {
      return this.parse(obj)
    } catch (ex) {
      return undefined
    }
  }
}

export class PayloadWrapper<TPayload extends XyoPayload = XyoPayload> extends PayloadWrapperBase<TPayload> {
  private static loaderFactory: PayloadLoaderFactory | null = null

  private isPayloadWrapper = true

  static override async load(address: DataLike) {
    if (this.loaderFactory === null) {
      console.warn('No loader factory set')
      return null
    } else {
      const payload = await this.loaderFactory()(address)
      return payload ? new PayloadWrapper(payload) : null
    }
  }

  static override parse<T extends XyoPayload = XyoPayload>(obj: unknown): PayloadWrapper<T> {
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

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }
}
