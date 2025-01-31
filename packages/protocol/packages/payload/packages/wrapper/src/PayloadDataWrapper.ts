import { assertEx } from '@xylabs/assert'
import type { Address } from '@xylabs/hex'
import type { EmptyObject } from '@xylabs/object'
import type { Payload, Schema } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'

import type { PayloadLoaderFactory } from './PayloadWrapperBase.ts'
import { isPayloadWrapperBase, PayloadWrapperBase } from './PayloadWrapperBase.ts'

export const isPayloadDataWrapper = (value?: unknown): value is PayloadDataWrapper => {
  return isPayloadWrapperBase(value)
}

export class PayloadDataWrapper<TFields extends Payload | EmptyObject = Payload,
  TSchema extends Schema = TFields extends Payload ? TFields['schema'] : Schema> extends PayloadWrapperBase<Payload<TFields, TSchema>> {
  protected static loaderFactory: PayloadLoaderFactory | null = null

  protected constructor(payload: Payload<TFields, TSchema>) {
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

  static parse<TFields extends Payload | EmptyObject,
    TSchema extends Schema = TFields extends Payload ?
      TFields['schema'] : Schema>(payload?: unknown): PayloadDataWrapper<TFields, TSchema> | undefined {
    const hydratedObj = typeof payload === 'string' ? JSON.parse(payload) : payload
    return this.wrap(hydratedObj as PayloadDataWrapper<TFields, TSchema> | Payload<TFields, TSchema>)
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

  static wrap<TFields extends Payload | EmptyObject,
    TSchema extends Schema = TFields extends Payload ?
      TFields['schema'] : Schema>(
    payload?: Payload<TFields, TSchema> | PayloadDataWrapper<TFields, TSchema>,
  ): PayloadDataWrapper<TFields, TSchema> {
    assertEx(!Array.isArray(payload), () => 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        if (payload instanceof PayloadDataWrapper) {
          return payload
        } else {
          const rawPayload = (isPayloadWrapperBase(payload) ? payload.payload : payload) as Payload<TFields, TSchema>
          const wrapper = new PayloadDataWrapper<TFields, TSchema>(rawPayload)
          return wrapper
        }
      }
      default: {
        throw new Error(`Can only parse objects [${typeof payload}]`)
      }
    }
  }

  static async wrappedMap<TFields extends Payload | EmptyObject,
    TSchema extends Schema = TFields extends Payload ?
      TFields['schema'] : Schema>(payloads: (Payload<TFields, TSchema> | PayloadDataWrapper<TFields, TSchema>)[]):
  Promise<Record<string, PayloadDataWrapper<TFields, TSchema>>> {
    const result: Record<string, PayloadDataWrapper<TFields, TSchema>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        const wrapper = PayloadDataWrapper.wrap(payload)
        result[await wrapper.dataHash()] = wrapper
      }),
    )
    return result
  }

  override async validate(): Promise<Error[]> {
    return this.payload ? await new PayloadValidator<TFields, TSchema>(this.payload).validate() : []
  }
}
