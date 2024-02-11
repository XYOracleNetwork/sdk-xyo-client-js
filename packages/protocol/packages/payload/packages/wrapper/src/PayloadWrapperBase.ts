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

  static async unwrap<TPayload extends Payload = Payload>(payload?: TPayload): Promise<WithMeta<TPayload> | undefined>
  static async unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper,
  ): Promise<WithMeta<TPayload>>
  static async unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: (TPayload | TWrapper)[],
  ): Promise<WithMeta<TPayload>[]>
  static async unwrap<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper | (TPayload | TWrapper)[],
  ): Promise<WithMeta<TPayload> | WithMeta<TPayload>[] | undefined> {
    return Array.isArray(payload)
      ? await Promise.all(payload.map((payload) => this.unwrapSinglePayload<TPayload, TWrapper>(payload)))
      : await this.unwrapSinglePayload<TPayload, TWrapper>(payload)
  }

  static async unwrapSinglePayload<TPayload extends Payload = Payload>(payload?: TPayload): Promise<WithMeta<TPayload> | undefined>
  static async unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload: TPayload | TWrapper,
  ): Promise<WithMeta<TPayload>>
  static async unwrapSinglePayload<TPayload extends Payload = Payload, TWrapper extends PayloadWrapperBase<TPayload> = PayloadWrapperBase<TPayload>>(
    payload?: TPayload | TWrapper,
  ): Promise<WithMeta<TPayload> | undefined> {
    if (payload === undefined) {
      return
    }

    if (!(typeof payload === 'object')) {
      throw new TypeError('Can not unwrap value that is not extended from object')
    }

    if (Array.isArray(payload)) {
      throw new TypeError('Can not unwrap value that is an array')
    }

    if (isPayloadWrapperBase(payload)) {
      return await PayloadBuilder.build(payload.payload)
    }

    if (isAnyPayload(payload)) {
      return await PayloadBuilder.build(payload)
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

  async hash() {
    return await PayloadBuilder.hash(this.payload)
  }

  //intentionally a function to prevent confusion with payload
  schema(): string {
    return assertEx(this.payload?.schema, 'Missing payload schema')
  }

  validate(): Promisable<Error[]> {
    return []
  }
}
