import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { AnyObject, isObject } from '@xylabs/object'
import { asBoundWitness, BoundWitness, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, WithMeta } from '@xyo-network/payload-model'
import { isPayloadWrapperBase, PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

export const isBoundWitnessWrapper = (value?: unknown): value is BoundWitnessWrapper => {
  if (isPayloadWrapperBase(value)) {
    return typeof (value as BoundWitnessWrapper).payloadsDataHashMap === 'function'
  }
  return false
}

export class BoundWitnessWrapper<
  TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness,
  TPayload extends Payload = Payload,
> extends PayloadWrapperBase<TBoundWitness> {
  private _payloadMap: Record<string, TPayload> | undefined

  protected constructor(
    public boundwitness: WithMeta<TBoundWitness>,
    public payloads: WithMeta<TPayload>[] = [],
    public moduleErrors?: WithMeta<Payload>[],
  ) {
    super(boundwitness)
  }

  get addresses() {
    return this.boundwitness.addresses
  }

  get payloadHashes() {
    return this.boundwitness.payload_hashes
  }

  get payloadSchemas() {
    return this.boundwitness.payload_schemas
  }

  get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  static as<T extends BoundWitness = BoundWitness>(value: unknown) {
    return value instanceof BoundWitnessWrapper ? (value as BoundWitnessWrapper<T>) : undefined
  }

  static async load(address: string) {
    const wrapper = await PayloadWrapper.load(address)
    const payload = wrapper?.payload
    assertEx(payload && isBoundWitness(payload), 'Attempt to load non-boundwitness')

    const boundWitness: BoundWitness | undefined = payload && isBoundWitness(payload) ? payload : undefined
    return boundWitness ? await BoundWitnessWrapper.wrap(boundWitness) : null
  }

  static async parse<T extends BoundWitness = BoundWitness, P extends Payload = Payload>(
    obj: unknown,
    payloads?: P[],
  ): Promise<BoundWitnessWrapper<T, P>> {
    let hydratedObj: AnyObject | undefined = undefined
    switch (typeof obj) {
      case 'string': {
        hydratedObj = JSON.parse(obj)
        break
      }
      case 'object': {
        if (isObject(obj)) {
          hydratedObj = obj
        }
        break
      }
    }

    if (hydratedObj) {
      if (isBoundWitnessWrapper(hydratedObj)) {
        return hydratedObj as BoundWitnessWrapper<T, P>
      }
      if (isBoundWitness(hydratedObj)) {
        //we use PayloadBuilder here since we want to use the BoundWitness as-is (no resigning), but want to add the $hash is needed
        const bw = await PayloadBuilder.build<T>(hydratedObj as T)
        return new BoundWitnessWrapper(bw, payloads ? await Promise.all(payloads?.map((payload) => PayloadBuilder.build(payload))) : [])
      }
    }

    throw new Error(`Unable to parse [${typeof obj}]`)
  }

  static async payloadsDataHashMap<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<Hash, WithMeta<TPayload>>> {
    const unwrapped = await this.unwrap(payloads)
    return await PayloadBuilder.toDataHashMap(unwrapped)
  }

  static async payloadsHashMap<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<Hash, TPayload>> {
    const unwrapped = await this.unwrap(payloads)
    return await PayloadBuilder.toHashMap(unwrapped)
  }

  static async tryParse<T extends BoundWitness, P extends Payload>(obj: unknown, payloads?: P[]): Promise<BoundWitnessWrapper<T, P> | undefined> {
    if (obj === undefined) return undefined
    try {
      return await this.parse(obj, payloads)
    } catch {
      return undefined
    }
  }

  static async wrap<T extends BoundWitness, P extends Payload>(obj: PayloadWrapperBase<T> | T, payloads?: P[]): Promise<BoundWitnessWrapper<T, P>> {
    switch (typeof obj) {
      case 'object': {
        if (obj instanceof BoundWitnessWrapper) {
          return obj
        } else if (obj instanceof PayloadWrapper && obj.schema() === BoundWitnessSchema) {
          return await BoundWitnessWrapper.parse(obj.payload, payloads)
        } else {
          return await BoundWitnessWrapper.parse(obj, payloads)
        }
      }
    }
  }

  static async wrappedDataHashMap<T extends BoundWitness>(
    boundWitnesses: (T | BoundWitnessWrapper<T>)[],
  ): Promise<Record<string, BoundWitnessWrapper<T>>> {
    const result: Record<string, BoundWitnessWrapper<T>> = {}
    await Promise.all(
      boundWitnesses.map(async (payload) => {
        const bw = await BoundWitnessWrapper.parse<T, Payload>(payload)
        result[await bw.dataHash()] = bw
      }),
    )
    return result
  }

  static async wrappedHashMap<T extends BoundWitness>(
    boundWitnesses: (T | BoundWitnessWrapper<T>)[],
  ): Promise<Record<string, BoundWitnessWrapper<T>>> {
    const result: Record<string, BoundWitnessWrapper<T>> = {}
    await Promise.all(
      boundWitnesses.map(async (bw) => {
        const wrapped: BoundWitnessWrapper<T> = await BoundWitnessWrapper.parse(bw)
        result[await wrapped.dataHash()] = await BoundWitnessWrapper.parse(bw)
      }),
    )
    return result
  }

  async dig(depth?: number): Promise<BoundWitnessWrapper<TBoundWitness>> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.indexOf(BoundWitnessSchema)
    if (innerBoundwitnessIndex > -1) {
      const innerBoundwitnessHash: Hash = this.payloadHashes[innerBoundwitnessIndex]
      const innerBoundwitnessPayload = asBoundWitness<WithMeta<TBoundWitness>>(
        (await BoundWitnessWrapper.payloadsDataHashMap(this.payloads))[innerBoundwitnessHash],
      )
      const innerBoundwitness: BoundWitnessWrapper<TBoundWitness> | undefined = innerBoundwitnessPayload
        ? new BoundWitnessWrapper<TBoundWitness>(innerBoundwitnessPayload, await PayloadBuilder.filterExclude(this.payloads, innerBoundwitnessHash))
        : undefined
      if (innerBoundwitness) {
        return innerBoundwitness.dig(depth ? depth - 1 : undefined)
      }
    }
    assertEx(!depth, () => `Dig failed [Remaining Depth: ${depth}]`)
    return this
  }

  async getMissingPayloads() {
    const payloadMap = await this.payloadsDataHashMap()
    return this.payloadHashes.filter((hash) => !payloadMap[hash])
  }

  async getWrappedPayloads(): Promise<PayloadWrapper<TPayload>[]> {
    return await Promise.all(this.payloads.map((payload) => PayloadWrapper.wrap(payload)))
  }

  hashesBySchema(schema: string) {
    const result: string[] = []
    for (const [index, payloadSchema] of this.payloadSchemas.entries()) {
      if (payloadSchema === schema) {
        result.push(this.payloadHashes[index])
      }
    }
    return result
  }

  async payloadsByDataHashes<T extends TPayload>(hashes: string[]): Promise<T[]> {
    const map = await this.payloadsDataHashMap()
    return hashes.map<T>((hash) => assertEx(map[hash], 'Hash not found') as T)
  }

  async payloadsByHashes<T extends TPayload>(hashes: string[]): Promise<T[]> {
    const map = await this.payloadsHashMap()
    return hashes.map<T>((hash) => assertEx(map[hash], 'Hash not found') as T)
  }

  payloadsBySchema<T extends TPayload>(schema: string): WithMeta<T>[] {
    return this.payloads.filter((payload) => payload?.schema === schema) as WithMeta<T>[]
  }

  async payloadsDataHashMap(): Promise<Record<string, TPayload>> {
    this._payloadMap = this._payloadMap ?? (await BoundWitnessWrapper.payloadsDataHashMap<TPayload>(this.payloads))
    return this._payloadMap
  }

  async payloadsHashMap(): Promise<Record<string, TPayload>> {
    this._payloadMap = this._payloadMap ?? (await BoundWitnessWrapper.payloadsHashMap<TPayload>(this.payloads))
    return this._payloadMap
  }

  prev(address: string) {
    return this.previousHashes[this.addresses.indexOf(address)]
  }

  toResult() {
    return [this.boundwitness, this.payloads]
  }

  override async validate(): Promise<Error[]> {
    return await new BoundWitnessValidator(this.boundwitness).validate()
  }
}
