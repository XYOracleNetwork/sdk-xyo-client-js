import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, Hasher } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadValidator } from '@xyo-network/payload-validator'
import { Promisable } from '@xyo-network/promise'

export type PayloadLoader = (address: DataLike) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export abstract class PayloadWrapperBase<TPayload extends Payload = Payload> extends Hasher<TPayload> {
  private _errors?: Error[]

  get body() {
    return deepOmitUnderscoreFields<TPayload>(this.obj)
  }

  get payload() {
    return assertEx(this.obj, 'Missing payload object')
  }

  get schema() {
    return this.payload.schema
  }

  //intentionally not naming this 'schema' so that the wrapper is not confused for a Payload
  get schemaName() {
    return assertEx(this.payload.schema, 'Missing payload schema')
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

  static unwrap<TPayload extends Payload = Payload>(payload?: Payload): TPayload | undefined
  static unwrap<TPayload extends Payload = Payload>(payload?: Payload[]): (TPayload | undefined)[]
  static unwrap<TPayload extends Payload = Payload>(payload?: Payload | Payload[]): TPayload | (TPayload | undefined)[] | undefined {
    if (Array.isArray(payload)) {
      return payload.map((payload) => this.unwrapSinglePayload<TPayload>(payload))
    } else {
      return this.unwrapSinglePayload<TPayload>(payload)
    }
  }

  private static unwrapSinglePayload<TPayload extends Payload = Payload>(payload?: Payload) {
    if (payload === undefined) {
      return undefined
    }
    if (payload instanceof PayloadWrapperBase) {
      return payload.payload as TPayload
    }
    if (!(payload instanceof Object)) {
      throw 'Can not unwrap class that is not extended from PayloadWrapperBase'
    }
    return payload as TPayload
  }

  async getErrors() {
    this._errors = this._errors ?? (await this.validate())
    return this._errors
  }

  async getValid() {
    return (await this.getErrors()).length === 0
  }

  abstract validate(): Promisable<Error[]>
}

export class PayloadWrapper<TPayload extends Payload = Payload> extends PayloadWrapperBase<TPayload> {
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

  static override parse<T extends Payload>(payload: unknown): PayloadWrapper<T> {
    assertEx(!Array.isArray(payload), 'Array can not be converted to PayloadWrapper')
    switch (typeof payload) {
      case 'object': {
        const castWrapper = payload as PayloadWrapper<T>
        const typedPayload = payload as T
        return assertEx(
          castWrapper?.isPayloadWrapper ? castWrapper : typedPayload.schema ? new PayloadWrapper(typedPayload) : null,
          'Unable to parse payload object',
        )
      }
      default:
        throw Error('Can only parse objects')
    }
  }

  static setLoaderFactory(factory: PayloadLoaderFactory | null) {
    this.loaderFactory = factory
  }

  static async toWrappedMap<T extends Payload>(payloads: (T | PayloadWrapper<T>)[]): Promise<Record<string, PayloadWrapper<T>>> {
    const result: Record<string, PayloadWrapper<T>> = {}
    await Promise.all(
      payloads.map(async (payload) => {
        result[await PayloadWrapper.hashAsync(payload)] = PayloadWrapper.parse(payload)
      }),
    )
    return result
  }

  override async validate(): Promise<Error[]> {
    return await new PayloadValidator(this.payload).validate()
  }
}
