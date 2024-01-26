import { assertEx } from '@xylabs/assert'
import { Promisable } from '@xylabs/promise'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, WithMeta } from '@xyo-network/payload-model'

export type PayloadLoader = (address: string) => Promise<Payload | null>
export type PayloadLoaderFactory = () => PayloadLoader

export class PayloadWrapperBase<TPayload extends Payload = Payload> extends PayloadHasher<TPayload> {
  private _errors?: Error[]

  protected constructor(payload: TPayload) {
    super(payload)
  }

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
      throw 'Can not unwrap class that is not extended from object'
    }

    return await PayloadBuilder.build(payload instanceof PayloadWrapperBase ? payload.jsonPayload() : payload)
  }

  /** @deprecated use jsonPayload instead */
  body() {
    return this.jsonPayload()
  }

  async dataHash() {
    return await PayloadBuilder.dataHash(this.jsonPayload())
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
