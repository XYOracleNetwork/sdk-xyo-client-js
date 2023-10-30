import { assertEx } from '@xylabs/assert'
import { exists } from '@xylabs/exists'
import { compact } from '@xylabs/lodash'
import { Promisable } from '@xylabs/promise'
import { BoundWitness, BoundWitnessSchema, isBoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { DataLike, PayloadHasher } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'

export class BoundWitnessWrapper<
  TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness,
  TPayload extends Payload = Payload,
> extends PayloadWrapperBase<TBoundWitness> {
  private _allPayloadMap: Record<string, TPayload> | undefined
  private _moduleErrors: PayloadWrapper[]
  private _payloadMap: Record<string, TPayload> | undefined
  private _payloads: PayloadWrapper<TPayload>[]
  private isBoundWitnessWrapper = true

  protected constructor(boundwitness: TBoundWitness, payloads?: (TPayload | undefined)[], moduleErrors?: (Payload | undefined)[]) {
    super(boundwitness)
    this._payloads = payloads ? compact(payloads.filter(exists).map((payload) => PayloadWrapper.wrap<TPayload>(payload))) : []
    this._moduleErrors = moduleErrors ? compact(moduleErrors.filter(exists).map((error) => PayloadWrapper.wrap<Payload>(error))) : []
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

  get payloadsArray(): PayloadWrapper<TPayload>[] {
    return Object.values(this._payloads ?? {})
  }

  get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  static as<T extends BoundWitness = BoundWitness>(value: unknown) {
    return value instanceof BoundWitnessWrapper ? (value as BoundWitnessWrapper<T>) : null
  }

  static async load(address: DataLike) {
    const wrapper = await PayloadWrapper.load(address)
    const payload = wrapper?.payload()
    assertEx(payload && isBoundWitness(payload), 'Attempt to load non-boundwitness')

    const boundWitness: BoundWitness | undefined = payload && isBoundWitness(payload) ? payload : undefined
    return boundWitness ? BoundWitnessWrapper.wrap(boundWitness) : null
  }

  static async mapPayloads<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<string, TPayload>> {
    return (
      await Promise.all(
        payloads?.map<Promise<[TPayload, string]>>(async (payload) => {
          const unwrapped = assertEx(PayloadWrapper.unwrap<TPayload>(payload))
          return [unwrapped, await PayloadHasher.hashAsync(unwrapped)]
        }),
      )
    ).reduce(
      (map, [payload, payloadHash]) => {
        map[payloadHash] = payload
        return map
      },
      {} as Record<string, TPayload>,
    )
  }

  static async mapWrappedPayloads<TPayload extends Payload>(payloads: TPayload[]): Promise<Record<string, PayloadWrapper<TPayload>>> {
    return (
      await Promise.all(
        payloads?.map<Promise<[TPayload, string]>>(async (payload) => {
          const unwrapped = assertEx(PayloadWrapper.unwrap<TPayload>(payload))
          return [unwrapped, await PayloadHasher.hashAsync(unwrapped)]
        }),
      )
    ).reduce(
      (map, [payload, payloadHash]) => {
        map[payloadHash] = PayloadWrapper.wrap(payload)
        return map
      },
      {} as Record<string, PayloadWrapper<TPayload>>,
    )
  }

  static parse<T extends BoundWitness, P extends Payload>(obj: unknown, payloads?: P[]): BoundWitnessWrapper<T, P> {
    const hydratedObj = typeof obj === 'string' ? JSON.parse(obj) : obj
    assertEx(!Array.isArray(hydratedObj), 'Array can not be converted to BoundWitnessWrapper')
    switch (typeof hydratedObj) {
      case 'object': {
        const castWrapper = hydratedObj as BoundWitnessWrapper<T, P>
        const newWrapper = castWrapper?.isBoundWitnessWrapper ? castWrapper : new BoundWitnessWrapper(hydratedObj as T, payloads)
        /*if (!newWrapper.getValid()) {
          console.warn('Wrapped invalid BoundWitness')
        }*/
        return newWrapper
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }

  static tryParse<T extends BoundWitness, P extends Payload>(obj: unknown, payloads?: P[]): BoundWitnessWrapper<T, P> | undefined {
    if (obj === undefined) return undefined
    try {
      return this.parse(obj, payloads)
    } catch (_ex) {
      return undefined
    }
  }

  static wrap<T extends BoundWitness, P extends Payload>(obj: PayloadWrapperBase<T> | T, payloads?: P[]): BoundWitnessWrapper<T, P> {
    switch (typeof obj) {
      case 'object': {
        const newWrapper = new BoundWitnessWrapper<T, P>(assertEx(BoundWitnessWrapper.unwrap<T>(obj)), payloads)
        /*if (!newWrapper.getValid()) {
          console.warn('Wrapped invalid BoundWitness')
        }*/
        return newWrapper
      }
    }
  }

  static async wrappedMap<T extends BoundWitness>(boundWitnesses: (T | BoundWitnessWrapper<T>)[]): Promise<Record<string, BoundWitnessWrapper<T>>> {
    const result: Record<string, BoundWitnessWrapper<T>> = {}
    await Promise.all(
      boundWitnesses.map(async (payload) => {
        result[await BoundWitnessWrapper.hashAsync(payload)] = BoundWitnessWrapper.parse(payload)
      }),
    )
    return result
  }

  async allPayloadMap(): Promise<Record<string, TPayload>> {
    this._allPayloadMap = this._allPayloadMap ?? (await BoundWitnessWrapper.mapPayloads<TPayload>(await this.getAllPayloads()))
    return this._allPayloadMap
  }

  async dig(depth?: number): Promise<BoundWitnessWrapper<TBoundWitness>> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.findIndex((item) => item === BoundWitnessSchema)
    if (innerBoundwitnessIndex > -1) {
      const innerBoundwitnessHash: string = this.payloadHashes[innerBoundwitnessIndex]
      const innerBoundwitnessPayload = (await BoundWitnessWrapper.mapWrappedPayloads(await this.getPayloads()))[innerBoundwitnessHash]
      const innerBoundwitness: BoundWitnessWrapper<TBoundWitness> | undefined = innerBoundwitnessPayload
        ? new BoundWitnessWrapper<TBoundWitness>(
            innerBoundwitnessPayload.jsonPayload() as unknown as TBoundWitness,
            (await PayloadHasher.filterExclude(this.payloadsArray, innerBoundwitnessHash)).map(
              (item) => item.jsonPayload() as unknown as TBoundWitness,
            ),
          )
        : undefined
      if (innerBoundwitness) {
        return innerBoundwitness.dig(depth ? depth - 1 : undefined)
      }
    }
    assertEx(!depth, `Dig failed [Remaining Depth: ${depth}]`)
    return this
  }

  async getAllPayloads(): Promise<TPayload[]> {
    return (await this.getAllWrappedPayloads()).map((wrapper) => wrapper.payload())
  }

  getAllWrappedPayloads(): Promisable<PayloadWrapper<TPayload>[]> {
    return this._payloads
  }

  async getMissingPayloads() {
    const payloadMap = await BoundWitnessWrapper.mapPayloads(await this.getPayloads())
    return this.payloadHashes.filter((hash) => !payloadMap[hash])
  }

  async getPayloads(): Promise<TPayload[]> {
    return (await this.getWrappedPayloads()).map((wrapper) => wrapper.payload())
  }

  getWrappedModuleErrors(): Promisable<PayloadWrapper[]> {
    return this._moduleErrors
  }

  getWrappedPayloads(): Promisable<PayloadWrapper<TPayload>[]> {
    return this._payloads
  }

  hashesBySchema(schema: string) {
    return this.payloadSchemas.reduce<string[]>((prev, payloadSchema, index) => {
      if (payloadSchema === schema) {
        prev.push(this.payloadHashes[index])
      }
      return prev
    }, [])
  }

  async payloadMap(): Promise<Record<string, TPayload>> {
    this._payloadMap = this._payloadMap ?? (await BoundWitnessWrapper.mapPayloads<TPayload>(await this.getPayloads()))
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
    return this.previousHashes[this.addresses.findIndex((addr) => address === addr)]
  }

  toResult() {
    return [this.boundwitness, this.payloadsArray.map((payload) => payload.jsonPayload())]
  }

  override async validate(): Promise<Error[]> {
    return await new BoundWitnessValidator(this.boundwitness).validate()
  }
}
