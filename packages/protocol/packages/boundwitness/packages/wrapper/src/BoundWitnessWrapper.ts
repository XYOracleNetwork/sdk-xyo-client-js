import { assertEx } from '@xylabs/assert'
import { Hash } from '@xylabs/hex'
import { isObject } from '@xylabs/object'
import { asBoundWitness, BoundWitness, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload, WithMeta } from '@xyo-network/payload-model'
import { isPayloadWrapperBase, PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

export const isBoundWitnessWrapper = <T extends BoundWitness = BoundWitness, P extends Payload = Payload>(
  value?: unknown,
): value is BoundWitnessWrapper<T, P> => {
  if (isPayloadWrapperBase(value)) {
    return typeof (value as BoundWitnessWrapper<T, P>).payloadsDataHashMap === 'function'
  }
  return false
}

export class BoundWitnessWrapper<
  TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness,
  TPayload extends Payload = Payload,
> extends PayloadWrapperBase<TBoundWitness> {
  private _payloadDataMap: Record<Hash, WithMeta<TPayload>> | undefined
  private _payloadMap: Record<Hash, WithMeta<TPayload>> | undefined

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

  static parse<T extends BoundWitness = BoundWitness, P extends Payload = Payload>(
    obj: unknown,
    payloads?: WithMeta<P>[],
  ): BoundWitnessWrapper<T, P> {
    let hydratedObj: WithMeta<T> | undefined = undefined
    switch (typeof obj) {
      case 'string': {
        hydratedObj = JSON.parse(obj) as WithMeta<T>
        break
      }
      case 'object': {
        if (isObject(obj)) {
          hydratedObj = obj as WithMeta<T>
        }
        break
      }
    }

    if (hydratedObj) {
      if (isBoundWitnessWrapper<T, P>(hydratedObj)) {
        return hydratedObj as BoundWitnessWrapper<T, P>
      }
      if (isBoundWitness(hydratedObj)) {
        return new BoundWitnessWrapper(hydratedObj, payloads ?? [])
      }
    }

    throw new Error(`Unable to parse [${typeof obj}]`)
  }

  static tryParse<T extends BoundWitness, P extends Payload>(obj: unknown, payloads?: WithMeta<P>[]): BoundWitnessWrapper<T, P> | undefined {
    if (obj === undefined) return undefined
    try {
      return this.parse(obj, payloads)
    } catch {
      return undefined
    }
  }

  static async wrap<T extends BoundWitness, P extends Payload>(
    obj: PayloadWrapperBase<T> | T,
    payloads?: WithMeta<P>[],
  ): Promise<BoundWitnessWrapper<T, P>> {
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
        const bw = BoundWitnessWrapper.parse<T, Payload>(payload)
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
        const wrapped: BoundWitnessWrapper<T> = BoundWitnessWrapper.parse(bw)
        result[await wrapped.hash()] = BoundWitnessWrapper.parse(bw)
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
        (await PayloadBuilder.toDataHashMap(this.payloads))[innerBoundwitnessHash],
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

  async payloadsByDataHashes(hashes: string[]): Promise<TPayload[]> {
    const map = await this.payloadsDataHashMap()
    return hashes.map((hash) => assertEx(map[hash], 'Hash not found') as TPayload)
  }

  async payloadsByHashes(hashes: string[]): Promise<TPayload[]> {
    const map = await this.payloadsHashMap()
    return hashes.map((hash) => assertEx(map[hash], 'Hash not found') as TPayload)
  }

  payloadsBySchema<T extends TPayload>(schema: string): WithMeta<T>[] {
    return this.payloads.filter((payload) => payload?.schema === schema) as WithMeta<T>[]
  }

  async payloadsDataHashMap(): Promise<Record<Hash, WithMeta<TPayload>>> {
    this._payloadDataMap = this._payloadDataMap ?? (await PayloadBuilder.toDataHashMap<TPayload>(this.payloads))
    return this._payloadDataMap
  }

  async payloadsHashMap(): Promise<Record<Hash, WithMeta<TPayload>>> {
    this._payloadMap = this._payloadMap ?? (await PayloadBuilder.toHashMap<TPayload>(this.payloads))
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
