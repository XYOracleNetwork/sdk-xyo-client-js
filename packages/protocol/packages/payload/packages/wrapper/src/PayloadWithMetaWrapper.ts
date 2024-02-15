import { assertEx } from '@xylabs/assert'
import { Payload } from '@xyo-network/payload-model'

import { isPayloadDataWrapper, PayloadDataWrapper } from './PayloadDataWrapper'
import { isPayloadWrapperBase, PayloadLoaderFactory } from './PayloadWrapperBase'

export const isPayloadWithMetaWrapper = (value?: unknown): value is PayloadWithMetaWrapper => {
  return isPayloadDataWrapper(value)
}

export class PayloadWithMetaWrapper<TPayload extends Payload = Payload> extends PayloadDataWrapper<TPayload> {
  protected constructor(payload: TPayload) {
    super(payload)
  }

  static override as<T extends Payload = Payload>(value: unknown) {
    return value instanceof PayloadDataWrapper ? (value as PayloadDataWrapper<T>) : null
  }

  static override async load(address: string) {
    if (this.loaderFactory === null) {
      console.warn('No loader factory set')
      return null
    } else {
      const payload = await this.loaderFactory()(address)
      return payload ? new PayloadWithMetaWrapper(payload) : null
    }
  }

  static override parse<T extends Payload>(payload?: unknown): PayloadDataWrapper<T> | undefined {
    const hydratedObj = typeof payload === 'string' ? JSON.parse(payload) : payload
    return this.wrap(hydratedObj as PayloadDataWrapper<T> | T)
  }

  static override setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static override tryParse<T extends Payload>(obj: unknown): PayloadDataWrapper<T> | undefined {
    if (obj === undefined || obj === null) return
    try {
      return this.parse<T>(obj)
    } catch {
      return undefined
    }
  }

  static override wrap<T extends Payload>(payload?: T | PayloadWithMetaWrapper<T>): PayloadWithMetaWrapper<T> {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return payload instanceof PayloadWithMetaWrapper
          ? payload
          : new PayloadWithMetaWrapper((isPayloadWrapperBase(payload) ? payload.payload : payload) as T)
      }
      default: {
        throw new Error(`Can only parse objects [${typeof payload}]`)
      }
    }
  }

  static override async wrappedMap<T extends Payload>(
    payloads: (T | PayloadWithMetaWrapper<T>)[],
  ): Promise<Record<string, PayloadWithMetaWrapper<T>>> {
    const result: Record<string, PayloadDataWrapper<T>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        const wrapper = await PayloadDataWrapper.wrap(payload)
        result[await wrapper.dataHash()] = wrapper
      }),
    )
    return result
  }
}
