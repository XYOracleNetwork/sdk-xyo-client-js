import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { isAnyPayload, Payload, WithMeta } from '@xyo-network/payload-model'

export type PayloadLoader = (address: string) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export const isPayloadWrapperBase = (value?: unknown): value is PayloadWrapperBase => {
  return value instanceof PayloadWrapperBase
}

export class PayloadWrapperBase<TPayload extends Payload = Payload> {
  private _errors?: Error[]

  protected constructor(public payload: TPayload) {}

  static unwrap<TPayload extends Payload = Payload>(payload?: TPayload): WithMeta<TPayload> | undefined
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper,
  ): TPayload
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: (TPayload | TWrapper)[],
  ): TPayload[]
  static unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper | (TPayload | TWrapper)[],
  ): TPayload | TPayload[] | undefined {
    return Array.isArray(payload)
      ? payload.map((payload) => this.unwrapSinglePayload<TPayload, TWrapper>(payload))
      : this.unwrapSinglePayload<TPayload, TWrapper>(payload)
  }

  static unwrapSinglePayload<TPayload extends Payload = Payload>(payload?: TPayload): TPayload | undefined
  static unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper,
  ): TPayload
  static unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ): TPayload | undefined {
    if (payload === undefined) {
      return
    }

    if (Array.isArray(payload)) {
      throw new TypeError('Can not unwrap value that is an array')
    }

    if (isPayloadWrapperBase(payload)) {
      return payload.payload
    }

    if (isAnyPayload(payload)) {
      return payload
    }

    throw new TypeError('Can not unwrap an object that is not a PayloadWrapper or Payload')
  }

  async dataHash() {
    return await PayloadBuilder.dataHash(this.payload)
  }

  async getErrors() {
    this._errors = this._errors ?? (await this.validate())
    return this._errors
  }

  async getValid() {
    return (await this.getErrors()).length === 0
  }

  //intentionally a function to prevent confusion with payload
  schema(): string {
    return assertEx(this.payload?.schema, 'Missing payload schema')
  }

  validate(): Promisable<Error[]> {
    return []
  }
}
