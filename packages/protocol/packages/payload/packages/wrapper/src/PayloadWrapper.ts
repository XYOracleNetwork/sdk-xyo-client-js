import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, PayloadHasher } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'

import { CreatableWrapper, creatableWrapper } from './CreatableWrapper'
import { Wrapper } from './Wrapper'

export type PayloadLoader = (address: DataLike) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

creatableWrapper()
export class PayloadWrapper<T extends Payload = Payload> extends PayloadHasher<T> implements Wrapper<T> {
  private _errors?: Error[]

  private isPayloadWrapper = true

  constructor(payload: T) {
    super(payload)
  }

  static create<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj: W['obj']): W {
    return new this(obj)
  }

  static is(obj: unknown) {
    return obj instanceof PayloadWrapper
  }

  static async mapPayloads<W extends Wrapper>(payloads: (W['obj'] | W)[]): Promise<Record<string, W['obj']>> {
    return (
      await Promise.all(
        payloads?.map<Promise<[W['obj'], string]>>(async (payload) => {
          const unwrapped: W['obj'] = assertEx(this.unwrap(payload))
          return [unwrapped, await PayloadHasher.hashAsync(unwrapped)]
        }),
      )
    ).reduce((map, [payload, payloadHash]) => {
      map[payloadHash] = payload
      return map
    }, {} as Record<string, W['obj']>)
  }

  static async mapWrappedPayloads<T extends Payload, W extends Wrapper<T> = Wrapper<T>>(
    this: CreatableWrapper<T, W>,
    payloads: (W['obj'] | W)[],
  ): Promise<Record<string, W>> {
    return (
      await Promise.all(
        payloads?.map<Promise<[W, string]>>(async (payload) => {
          const unwrapped: W['obj'] = assertEx(this.unwrap(payload))
          return [this.wrap(unwrapped), await PayloadHasher.hashAsync(unwrapped)]
        }),
      )
    ).reduce((map, [payload, payloadHash]) => {
      map[payloadHash] = this.parse(payload)
      return map
    }, {} as Record<string, W>)
  }

  static parse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj?: unknown): W {
    const hydratedObj = typeof obj === 'string' ? JSON.parse(obj) : obj
    assertEx(!Array.isArray(hydratedObj), 'Array can not be converted to PayloadWrapper')

    switch (typeof hydratedObj) {
      case 'object': {
        return this.wrap(hydratedObj as W['obj'])
      }
      default:
        throw Error(`Can only parse objects [${typeof hydratedObj}]`)
    }
  }

  static tryParse<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, obj: unknown) {
    if (obj === undefined) return undefined
    try {
      return this.parse(obj)
    } catch (ex) {
      return undefined
    }
  }

  static tryUnwrap<W extends Wrapper>(payload: W['obj'] | W | undefined): W['obj'] | undefined {
    if (payload === undefined) return undefined
  }

  static tryUnwrapMany<W extends Wrapper>(payloads: (W['obj'] | W | undefined)[] = []): (W['obj'] | undefined)[] {
    return payloads.map((payload) => this.tryUnwrap(payload))
  }

  static unwrap<W extends Wrapper>(payload: W['obj'] | W): W['obj'] {
    if (payload instanceof PayloadWrapper) {
      return payload.payload()
    }
    return payload as W['obj']
  }

  static unwrapMany<W extends Wrapper>(payloads: (W['obj'] | W)[]) {
    return payloads.map((payload) => this.unwrap(payload))
  }

  static wrap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payload: W['obj'] | W): W {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return assertEx(this.create(PayloadWrapper.unwrap(payload)), 'Unable to parse payload object')
      }
      default:
        throw Error(`Can only parse objects [${typeof payload}]`)
    }
  }

  static wrapMany<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payloads?: (W['obj'] | W)[]): W[] {
    return payloads?.map((payload) => this.wrap(payload)) ?? []
  }

  static async wrappedMap<T extends Payload, W extends Wrapper<T>>(this: CreatableWrapper<T, W>, payloads: W['obj'][]): Promise<Record<string, W>> {
    const pairs: [string, W][] = await Promise.all(
      payloads.map(async (payload) => {
        return [await PayloadWrapper.hashAsync(payload), this.wrap(payload)]
      }),
    )
    return pairs.reduce<Record<string, W>>((prev, pair) => {
      prev[pair[0]] = pair[1]
      return prev
    }, {})
  }

  body() {
    return deepOmitUnderscoreFields<T>(this.obj)
  }

  async getErrors() {
    this._errors = this._errors ?? (await this.validate())
    return this._errors
  }

  async getValid() {
    return (await this.getErrors()).length === 0
  }

  payload(): T {
    return this.obj
  }

  //intentionally a function to prevent confusion with payload
  schema(): string {
    return assertEx(this.payload()?.schema, 'Missing payload schema')
  }

  async validate(): Promise<Error[]> {
    return await new PayloadValidator<T>(this.payload()).validate()
  }
}

const x = PayloadWrapper.parse({ schema: 'test' })
