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

  static create<T extends PayloadWrapper>(this: CreatableWrapper<T>, obj: T['obj']) {
    return new this(obj)
  }

  static is(obj: unknown) {
    return obj instanceof PayloadWrapper
  }

  static async mapPayloads<W extends PayloadWrapper>(this: CreatableWrapper<W>, payloads: (W['obj'] | W)[]): Promise<Record<string, W['obj']>> {
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

  static async mapWrappedPayloads<W extends PayloadWrapper = PayloadWrapper>(
    this: CreatableWrapper<W>,
    payloads: (W['obj'] | W)[],
  ): Promise<Record<string, W>> {
    return (
      await Promise.all(
        payloads?.map<Promise<[W, string]>>(async (payload) => {
          const unwrapped = assertEx(this.unwrap(payload))
          return [this.wrap(unwrapped), await PayloadHasher.hashAsync(unwrapped)]
        }),
      )
    ).reduce((map, [payload, payloadHash]) => {
      map[payloadHash] = this.wrap(payload)
      return map
    }, {} as Record<string, W>)
  }

  static parse<W extends PayloadWrapper>(this: CreatableWrapper<W>, obj?: unknown) {
    const hydratedObj = typeof obj === 'string' ? JSON.parse(obj) : obj
    assertEx(!Array.isArray(hydratedObj), 'Array can not be converted to PayloadWrapper')

    switch (typeof hydratedObj) {
      case 'object': {
        return this.wrap(hydratedObj)
      }
      default:
        throw Error(`Can only parse objects [${typeof hydratedObj}]`)
    }
  }

  static tryParse<W extends PayloadWrapper>(this: CreatableWrapper<W>, obj: unknown) {
    if (obj === undefined) return undefined
    try {
      return this.parse(obj)
    } catch (ex) {
      return undefined
    }
  }

  static tryUnwrap<W extends PayloadWrapper>(this: CreatableWrapper<W>, payload: W['obj'] | W | undefined): W['obj'] | undefined {
    if (payload === undefined) return undefined
    try {
      return this.unwrap(payload)
    } catch (_ex) {
      return undefined
    }
  }

  static tryUnwrapMany<T extends PayloadWrapper>(this: CreatableWrapper<T>, payloads: (T['obj'] | T | undefined)[] = []): (T['obj'] | undefined)[] {
    return payloads.map((payload) => this.tryUnwrap(payload))
  }

  static unwrap<T extends PayloadWrapper>(this: CreatableWrapper<T>, payload: T['obj'] | T): T['obj'] {
    if (payload instanceof PayloadWrapper) {
      return payload.payload()
    }
    return payload as T['obj']
  }

  static unwrapMany<T extends PayloadWrapper>(this: CreatableWrapper<T>, payloads: (T['obj'] | T)[]) {
    return payloads.map((payload) => this.unwrap(payload))
  }

  static wrap<T extends PayloadWrapper>(this: CreatableWrapper<T>, payload: T | T['obj']) {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        return assertEx(this.create(this.unwrap(payload)), 'Unable to parse payload object')
      }
      default:
        throw Error(`Can only parse objects [${typeof payload}]`)
    }
  }

  static wrapMany<T extends PayloadWrapper>(this: CreatableWrapper<T>, payloads: (T['obj'] | T)[]): T[] {
    return payloads?.map((payload) => this.wrap(payload)) ?? []
  }

  static async wrappedMap<T extends PayloadWrapper>(this: CreatableWrapper<T>, payloads: (T['obj'] | T)[]): Promise<Record<string, T>> {
    const pairs: [string, T][] = await Promise.all(
      payloads.map(async (payload) => {
        return [await PayloadWrapper.hashAsync(payload), this.wrap(payload)]
      }),
    )
    return pairs.reduce<Record<string, T>>((prev, pair) => {
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

  payload() {
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

const b = new PayloadWrapper({ schema: 'test' })
const a = PayloadWrapper.create({ schema: 'test' })
const x = PayloadWrapper.parse({ schema: 'test' }).payload()
const y = PayloadWrapper.wrap({ schema: 'test' })
const z1 = PayloadWrapper.unwrap({ schema: 'test' })
const z2 = PayloadWrapper.unwrap(y)
const z3: Payload | undefined = PayloadWrapper.tryUnwrap({ schema: 'test' })
const z4: Payload | undefined = PayloadWrapper.tryUnwrap(y)
