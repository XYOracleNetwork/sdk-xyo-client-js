import { assertEx } from '@xylabs/assert'
import { PayloadBuilder } from '@xyo-network/payload-builder'
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

  static async load(address: string) {
    if (this.loaderFactory === null) {
      console.warn('No loader factory set')
      return null
    } else {
      const payload = await this.loaderFactory()(address)
      return payload ? new PayloadWrapper(payload) : null
    }
  }

  static async parse<T extends Payload>(payload?: unknown): Promise<PayloadWrapper<T> | undefined> {
    const hydratedObj = typeof payload === 'string' ? JSON.parse(payload) : payload
    return await this.wrap(hydratedObj as PayloadWrapper<T> | T)
  }

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static async tryParse<T extends Payload>(obj: unknown): Promise<PayloadWrapper<T> | null | undefined> {
    if (obj === undefined || obj === null) return obj
    try {
      return await this.parse<T>(obj)
    } catch {
      return undefined
    }
  }

  static async wrap<T extends Payload>(payload?: T | PayloadWrapper<T>): Promise<PayloadWrapper<T>> {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return payload instanceof PayloadWrapper ? payload : new PayloadWrapper(await PayloadBuilder.build(payload))
      }
      default: {
        throw new Error(`Can only parse objects [${typeof payload}]`)
      }
    }
  }

  static async wrappedMap<T extends Payload>(payloads: (T | PayloadWrapper<T>)[]): Promise<Record<string, PayloadWrapper<T>>> {
    const result: Record<string, PayloadWrapper<T>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        result[await PayloadWrapper.hash(payload)] = await PayloadWrapper.wrap(payload)
      }),
    )
    return result
  }

  override async validate(): Promise<Error[]> {
    const payload = this.jsonPayload()
    return payload ? await new PayloadValidator<TPayload>(payload).validate() : []
  }
}
