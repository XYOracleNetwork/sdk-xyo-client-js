import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, PayloadHasher } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'

import { CreatableWrapper, Wrapper } from './CreatableWrapper'

export type PayloadLoader = (address: DataLike) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export type CreatablePayloadWrapper<T extends Payload, W extends PayloadWrapper<T>> = CreatableWrapper<T, W>

export class PayloadWrapper<TPayload extends Payload = Payload> extends PayloadHasher<TPayload> implements Wrapper<TPayload> {
  private static loaderFactory: PayloadLoaderFactory | null = null
  private _errors?: Error[]

  static is(obj: unknown) {
    return obj instanceof PayloadWrapper
  }

  static async load(address: DataLike) {
    if (this.loaderFactory === null) {
      console.warn('No loader factory set')
      return null
    } else {
      const payload = await this.loaderFactory()(address)
      return payload ? new PayloadWrapper(payload) : null
    }
  }

  static parse<T extends Payload, W extends PayloadWrapper<T>>(this: CreatablePayloadWrapper<T, W>, payload?: unknown) {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return this.wrap(payload as T)
      }
      default:
        throw Error(`Can only parse objects [${typeof payload}]`)
    }
  }

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static tryParse<T extends Payload, W extends PayloadWrapper<T>>(this: CreatablePayloadWrapper<T, W>, obj: unknown) {
    if (obj === undefined) return undefined
    try {
      return this.parse(obj)
    } catch (ex) {
      return undefined
    }
  }

  static unwrap<T extends Payload, W extends PayloadWrapper<T>>(this: CreatablePayloadWrapper<T, W>, payload?: T | W): T {
    if (payload instanceof PayloadWrapper) {
      return payload.payload() as T
    }
    if (!(typeof payload === 'object')) {
      throw 'Can not unwrap class that is not extended from object'
    }
    return payload as T
  }

  static unwrapMany<T extends Payload, W extends PayloadWrapper<T>>(this: CreatablePayloadWrapper<T, W>, payloads?: (T | W)[]): (T | undefined)[] {
    return payloads?.map((payload) => this.unwrap(payload)) ?? []
  }

  static wrap<T extends Payload, W extends PayloadWrapper<T>>(this: CreatablePayloadWrapper<T, W>, payload?: T | W) {
    switch (typeof payload) {
      case 'object': {
        const castWrapper = payload as W
        const typedPayload = payload as T
        return assertEx(
          PayloadWrapper.is(castWrapper) ? castWrapper : typedPayload.schema ? new this(typedPayload) : null,
          'Unable to parse payload object',
        )
      }
      default:
        throw Error(`Can only parse objects [${typeof payload}]`)
    }
  }

  static async wrappedMap<T extends Payload, W extends PayloadWrapper<T>>(
    this: CreatablePayloadWrapper<T, W>,
    payloads: (T | W)[],
  ): Promise<Record<string, W>> {
    const result: Record<string, W> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        const hash = await PayloadWrapper.hashAsync(payload)
        result[hash] = this.wrap(payload)
      }),
    )
    return result
  }

  body() {
    return deepOmitUnderscoreFields<TPayload>(this.obj)
  }

  async getErrors() {
    this._errors = this._errors ?? (await this.validate())
    return this._errors
  }

  async getValid() {
    return (await this.getErrors()).length === 0
  }

  payload(): TPayload {
    return assertEx(this.obj, 'Missing payload object')
  }

  //intentionally a function to prevent confusion with payload
  schema(): string {
    return assertEx(this.payload()?.schema, 'Missing payload schema')
  }

  async validate(): Promise<Error[]> {
    const payload = this.payload()
    return payload ? await new PayloadValidator<TPayload>(payload).validate() : []
  }
}
