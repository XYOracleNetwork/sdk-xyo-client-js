import { assertEx } from '@xylabs/assert'
import { DataLike } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'

import { PayloadLoaderFactory, PayloadWrapperBase } from './PayloadWrapperBase'

export class PayloadWrapper<TPayload extends Payload = Payload> extends PayloadWrapperBase<TPayload> {
  private static loaderFactory: PayloadLoaderFactory | null = null

  protected constructor(payload: TPayload) {
    super(payload)
  }

  static as<T extends Payload = Payload>(value: unknown) {
    return value instanceof PayloadWrapper ? (value as PayloadWrapper<T>) : null
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

  static parse<T extends Payload>(payload?: unknown): PayloadWrapper<T> | undefined {
    const hydratedObj = typeof payload === 'string' ? JSON.parse(payload) : payload
    return this.wrap(hydratedObj as PayloadWrapper<T> | T)
  }

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static tryParse<T extends Payload>(obj: unknown): PayloadWrapper<T> | null | undefined {
    if (obj === undefined || obj === null) return obj
    try {
      return this.parse<T>(obj)
    } catch (ex) {
      return undefined
    }
  }

  static wrap<T extends Payload>(payload?: T | PayloadWrapper<T>): PayloadWrapper<T> {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        const typedPayload = payload as T
        return assertEx(
          PayloadWrapper.as(payload) ? (payload as PayloadWrapper<T>) : typedPayload.schema ? new PayloadWrapper(typedPayload) : undefined,
          'Unable to parse payload object',
        )
      }
      default:
        throw Error(`Can only parse objects [${typeof payload}]`)
    }
  }

  static async wrappedMap<T extends Payload>(payloads: (T | PayloadWrapper<T>)[]): Promise<Record<string, PayloadWrapper<T>>> {
    const result: Record<string, PayloadWrapper<T>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        result[await PayloadWrapper.hashAsync(assertEx(PayloadWrapper.unwrap(payload)))] = PayloadWrapper.wrap(payload)
      }),
    )
    return result
  }

  override async validate(): Promise<Error[]> {
    const payload = this.payload()
    return payload ? await new PayloadValidator<TPayload>(payload).validate() : []
  }
}
