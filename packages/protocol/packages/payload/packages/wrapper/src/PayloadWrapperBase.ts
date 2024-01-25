import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { PayloadHasher } from '@xyo-network/hash'
import { Payload } from '@xyo-network/payload-model'

export type PayloadLoader = (address: string) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export class PayloadWrapperBase<TPayload extends Payload = Payload> extends PayloadHasher<TPayload> {
  private _errors?: Error[]

  protected constructor(payload: TPayload) {
    super(payload)
  }

  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ): TPayload | undefined
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: (TPayload | TWrapper)[],
  ): (TPayload | undefined)[]
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper | (TPayload | TWrapper)[],
  ): TPayload | (TPayload | undefined)[] | undefined {
    return Array.isArray(payload)
      ? payload.map((payload) => this.unwrapSinglePayload<TPayload, TWrapper>(payload))
      : this.unwrapSinglePayload<TPayload, TWrapper>(payload)
  }

  static unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ) {
    if (payload === undefined) {
      return
    }
    if (payload instanceof PayloadWrapperBase) {
      return payload.jsonPayload() as TPayload
    }
    if (!(typeof payload === 'object')) {
      throw 'Can not unwrap class that is not extended from object'
    }
    return payload as TPayload
  }

  /** @deprecated use jsonPayload instead */
  body() {
    return this.jsonPayload()
  }

  async dataHash() {
    return await PayloadHasher.hashAsync(this.jsonPayload())
  }

  async getErrors() {
    this._errors = this._errors ?? (await this.validate())
    return this._errors
  }

  async getValid() {
    return (await this.getErrors()).length === 0
  }

  /** @deprecated use jsonPayload(true) instead */
  payload(): TPayload {
    return this.jsonPayload(true)
  }

  //intentionally a function to prevent confusion with payload
  schema(): string {
    return assertEx(this.jsonPayload()?.schema, 'Missing payload schema')
  }

  validate(): Promisable<Error[]> {
    return []
  }
}
