import { assertEx } from '@xylabs/assert'
import { DataLike, deepOmitUnderscoreFields, PayloadHasher } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { Promisable } from '@xyo-network/promise'

export type PayloadLoader = (address: DataLike) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export class PayloadWrapperBase<TPayload extends Payload = Payload> extends PayloadHasher<TPayload> {
  private _errors?: Error[]

  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ): TPayload | undefined
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: (TPayload | TWrapper)[],
  ): (TPayload | undefined)[]
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper | (TPayload | TWrapper)[],
  ): TPayload | (TPayload | undefined)[] | undefined {
    if (Array.isArray(payload)) {
      return payload.map((payload) => this.unwrapSinglePayload<TPayload, TWrapper>(payload))
    } else {
      return this.unwrapSinglePayload<TPayload, TWrapper>(payload)
    }
  }

  static unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ) {
    if (payload === undefined) {
      return undefined
    }
    if (payload instanceof PayloadWrapperBase) {
      return payload.payload() as TPayload
    }
    if (!(typeof payload === 'object')) {
      throw 'Can not unwrap class that is not extended from object'
    }
    return payload as TPayload
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

  validate(): Promisable<Error[]> {
    return []
  }
}
