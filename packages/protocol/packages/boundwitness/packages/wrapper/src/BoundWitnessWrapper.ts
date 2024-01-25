import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { compact } from '@xylabs/lodash'
import { BoundWitness, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { PayloadHasher } from '@xyo-network/hash'
import { PayloadBuilder } from '@xyo-network/payload-builder'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

export class BoundWitnessWrapper<
  TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness,
  TPayload extends Payload = Payload,
> extends PayloadWrapperBase<TBoundWitness> {
  private _allPayloadMap: Record<string, TPayload> | undefined
  private _moduleErrors: Payload[]
  private _payloadMap: Record<string, TPayload> | undefined
  private _payloads: TPayload[]

  protected constructor(boundwitness: TBoundWitness, payloads?: TPayload[], moduleErrors?: Payload[]) {
    super(boundwitness)
    this._payloads = payloads ? compact(payloads.filter(exists)) : []
    this._moduleErrors = moduleErrors ? compact(moduleErrors.filter(exists)) : []
  }

  get addresses() {
    return this.boundwitness.addresses
  }

  get boundwitness() {
    return this.obj
  }

  get payloadHashes() {
    return this.boundwitness.payload_hashes
  }

  get payloadSchemas() {
    return this.boundwitness.payload_schemas
  }

  get payloadsArray(): TPayload[] {
    return Object.values(this._payloads ?? {})
  }

  get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  static as<T extends BoundWitness = BoundWitness>(value: unknown) {
    return value instanceof BoundWitnessWrapper ? (value as BoundWitnessWrapper<T>) : null
  }

  static async load(address: string) {
    const wrapper = await PayloadWrapper.load(address)
    const payload = wrapper?.jsonPayload()
    assertEx(payload && isBoundWitness(payload), 'Attempt to load non-boundwitness')

    const boundWitness: BoundWitness | undefined = payload && isBoundWitness(payload) ? payload : undefined
    return boundWitness ? await BoundWitnessWrapper.wrap(boundWitness) : null
  }

  static async mapPayloads<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<string, TPayload>> {
    const result: Record<string, TPayload> = {}
    const payloadPairs = await Promise.all(
      payloads?.map<Promise<[TPayload, string]>>(async (payload) => {
        const unwrapped = assertEx(PayloadWrapper.unwrap<TPayload>(payload))
        return [unwrapped, (await PayloadBuilder.build(unwrapped)).$hash]
      }),
    )

    for (const [payload, payloadHash] of payloadPairs) {
      result[payloadHash] = payload
    }
    return result
  }

  static async mapWrappedPayloads<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<string, PayloadWrapper<TPayload>>> {
    const result: Record<string, PayloadWrapper<TPayload>> = {}
    const payloadPairs = await Promise.all(
      payloads?.map<Promise<[TPayload, string]>>(async (payload) => {
        const unwrapped = assertEx(PayloadWrapper.unwrap<TPayload>(payload))
        return [unwrapped, await PayloadHasher.hashAsync(unwrapped)]
      }),
    )

    await Promise.all(
      payloadPairs.map(async ([payload, hash]) => {
        result[hash] = await PayloadWrapper.wrap(payload)
      }),
    )
    return result
  }

  static async parse<T extends BoundWitness, P extends Payload>(obj: unknown, payloads?: P[]): Promise<BoundWitnessWrapper<T, P>> {
    const hydratedObj = await PayloadBuilder.build(typeof obj === 'string' ? JSON.parse(obj) : obj)
    assertEx(!Array.isArray(hydratedObj), 'Array can not be converted to BoundWitnessWrapper')
    switch (typeof hydratedObj) {
      case 'object': {
        return hydratedObj instanceof BoundWitnessWrapper ? hydratedObj : new BoundWitnessWrapper(hydratedObj, payloads)
      }
    }
    throw new Error(`Unable to parse [${typeof obj}]`)
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
          return await BoundWitnessWrapper.parse(obj.jsonPayload(), payloads)
        } else {
          return await BoundWitnessWrapper.parse(obj, payloads)
        }
      }
    }
  }

  static async wrappedDataMap<T extends BoundWitness>(
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

  static async wrappedMap<T extends BoundWitness>(boundWitnesses: (T | BoundWitnessWrapper<T>)[]): Promise<Record<string, BoundWitnessWrapper<T>>> {
    const result: Record<string, BoundWitnessWrapper<T>> = {}
    await Promise.all(
      boundWitnesses.map(async (payload) => {
        result[await BoundWitnessWrapper.hashAsync(payload)] = await BoundWitnessWrapper.parse(payload)
      }),
    )
    return result
  }

  async allPayloadMap(): Promise<Record<string, TPayload>> {
    this._allPayloadMap = this._allPayloadMap ?? (await BoundWitnessWrapper.mapPayloads<TPayload>(this.getPayloads()))
    return this._allPayloadMap
  }

  async dig(depth?: number): Promise<BoundWitnessWrapper<TBoundWitness>> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.indexOf(BoundWitnessSchema)
    if (innerBoundwitnessIndex > -1) {
      const innerBoundwitnessHash: string = this.payloadHashes[innerBoundwitnessIndex]
      const innerBoundwitnessPayload = (await BoundWitnessWrapper.mapWrappedPayloads(await this.getPayloads()))[innerBoundwitnessHash]
      const innerBoundwitness: BoundWitnessWrapper<TBoundWitness> | undefined = innerBoundwitnessPayload
        ? new BoundWitnessWrapper<TBoundWitness>(
            innerBoundwitnessPayload.jsonPayload() as unknown as TBoundWitness,
            await PayloadHasher.filterExclude(this.payloadsArray, innerBoundwitnessHash),
          )
        : undefined
      if (innerBoundwitness) {
        return innerBoundwitness.dig(depth ? depth - 1 : undefined)
      }
    }
    assertEx(!depth, `Dig failed [Remaining Depth: ${depth}]`)
    return this
  }

  async getMissingPayloads() {
    const payloadMap = await BoundWitnessWrapper.mapPayloads(await this.getPayloads())
    return this.payloadHashes.filter((hash) => !payloadMap[hash])
  }

  getModuleErrors(): Payload[] {
    return this._moduleErrors
  }

  getPayloads(): TPayload[] {
    return this._payloads
  }

  async getWrappedPayloads(): Promise<PayloadWrapper<TPayload>[]> {
    return await Promise.all(this._payloads.map((payload) => PayloadWrapper.wrap(payload)))
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

  async payloadMap(): Promise<Record<string, TPayload>> {
    this._payloadMap = this._payloadMap ?? (await BoundWitnessWrapper.mapPayloads<TPayload>(this.getPayloads()))
    return this._payloadMap
  }

  async payloadsByHashes<T extends TPayload>(hashes: string[]): Promise<T[]> {
    const map = await this.payloadMap()
    return hashes.map<T>((hash) => assertEx(map[hash], 'Hash not found') as T)
  }

  async payloadsBySchema<T extends TPayload>(schema: string): Promise<T[]> {
    return (await this.getPayloads()).filter((payload) => payload?.schema === schema) as T[]
  }

  prev(address: string) {
    return this.previousHashes[this.addresses.indexOf(address)]
  }

  toResult() {
    return [this.boundwitness, this.payloadsArray]
  }

  override async validate(): Promise<Error[]> {
    return await new BoundWitnessValidator(this.boundwitness).validate()
  }
}
