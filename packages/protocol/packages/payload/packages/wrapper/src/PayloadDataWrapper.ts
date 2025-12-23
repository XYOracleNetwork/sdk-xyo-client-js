import type { Address } from '@xylabs/sdk-js'
import { assertEx } from '@xylabs/sdk-js'
import type { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'

import type { PayloadLoaderFactory } from './PayloadWrapperBase.ts'
import { isPayloadWrapperBase, PayloadWrapperBase } from './PayloadWrapperBase.ts'

export const isPayloadDataWrapper = (value?: unknown): value is PayloadDataWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadDataWrapper<TPayload extends Payload = Payload> extends PayloadWrapperBase<TPayload> {
  protected static loaderFactory: PayloadLoaderFactory | null = null

  protected constructor(payload: TPayload) {
    super(payload)
  }

  static as<T extends Payload = Payload>(value: unknown) {
    return value instanceof PayloadDataWrapper ? (value as PayloadDataWrapper<T>) : null
  }

  static async load(address: Address) {
    if (this.loaderFactory === null) {
      console.warn('No loader factory set')
      return null
    } else {
      const payload = await this.loaderFactory()(address)
      return payload ? new PayloadDataWrapper(payload) : null
    }
  }

  static parse<T extends Payload>(payload?: unknown): PayloadDataWrapper<T> | undefined {
    const hydratedObj = typeof payload === 'string' ? JSON.parse(payload) : payload
    return this.wrap(hydratedObj as PayloadDataWrapper<T> | T)
  }

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static tryParse<T extends Payload>(obj: unknown): PayloadDataWrapper<T> | undefined {
    if (obj === undefined || obj === null) return
    try {
      return this.parse<T>(obj)
    } catch {
      return undefined
    }
  }

  static wrap<T extends Payload>(payload?: T | PayloadDataWrapper<T>): PayloadDataWrapper<T> {
    assertEx(!Array.isArray(payload), () => 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return payload instanceof PayloadDataWrapper
          ? payload
          : (
              new PayloadDataWrapper((isPayloadWrapperBase(payload) ? payload.payload : payload) as T)
            )
      }
      default: {
        throw new Error(`Can only parse objects [${typeof payload}]`)
      }
    }
  }

  static async wrappedMap<T extends Payload>(payloads: (T | PayloadDataWrapper<T>)[]): Promise<Record<string, PayloadDataWrapper<T>>> {
    const result: Record<string, PayloadDataWrapper<T>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        const wrapper = PayloadDataWrapper.wrap(payload)
        result[await wrapper.dataHash()] = wrapper
      }),
    )
    return result
  }

  override async validate(): Promise<Error[]> {
    return this.payload ? await new PayloadValidator<TPayload>(this.payload).validate() : []
  }
}
