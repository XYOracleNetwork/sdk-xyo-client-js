import { assertEx } from '@xylabs/assert'
import { BoundWitness, isBoundWitnessPayload } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { DataLike } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper } from '@xyo-network/payload-wrapper'
import { Promisable } from '@xyo-network/promise'
import compact from 'lodash/compact'

export class BoundWitnessWrapper<TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness> extends PayloadWrapper<TBoundWitness> {
  private _allPayloadMap: Record<string, Payload> | undefined
  private _payloadMap: Record<string, Payload> | undefined
  private _payloads: PayloadWrapper[]
  private isBoundWitnessWrapper = true

  constructor(boundwitness: TBoundWitness, payloads?: (Payload | PayloadWrapper<Payload> | undefined)[]) {
    super(boundwitness)
    this._payloads = payloads ? compact(payloads.map((payload) => PayloadWrapper.parse(payload))) : []
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

  get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  static override async load(address: DataLike) {
    const wrapper = await PayloadWrapper.load(address)
    const payload = wrapper?.payload()
    assertEx(payload && isBoundWitnessPayload(payload), 'Attempt to load non-boundwitness')

    const boundWitness: BoundWitness | undefined = payload && isBoundWitnessPayload(payload) ? payload : undefined
    return boundWitness ? new BoundWitnessWrapper(boundWitness) : null
  }

  /*async allPayloadMap(): Promise<Record<string, Payload>> {
    this._allPayloadMap = this._allPayloadMap ?? (await BoundWitnessWrapper.mapPayloads(await this.getAllPayloads()))
    return this._allPayloadMap
  }*/

  /*
  async dig(depth?: number): Promise<BoundWitnessWrapper<TBoundWitness>> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.findIndex((item) => item === BoundWitnessSchema)
    if (innerBoundwitnessIndex > -1) {
      const innerBoundwitnessHash: string = this.payloadHashes[innerBoundwitnessIndex]
      const innerBoundwitnessPayload = (await BoundWitnessWrapper.mapWrappedPayloads(await this.getPayloads()))[innerBoundwitnessHash]
      const innerBoundwitness: BoundWitnessWrapper<TBoundWitness> | undefined = innerBoundwitnessPayload
        ? new BoundWitnessWrapper<TBoundWitness>(
            innerBoundwitnessPayload.body() as unknown as TBoundWitness,
            (await PayloadHasher.filterExclude(this.payloadsArray, innerBoundwitnessHash)).map((item) => item.body() as unknown as TBoundWitness),
          )
        : undefined
      if (innerBoundwitness) {
        return innerBoundwitness.dig(depth ? depth - 1 : undefined)
      }
    }
    assertEx(!depth, `Dig failed [Remaining Depth: ${depth}]`)
    return this
  }
  */

  async getAllPayloads(): Promise<Payload[]> {
    return (await this.getAllWrappedPayloads()).map((wrapper) => wrapper.payload())
  }

  getAllWrappedPayloads(): Promisable<PayloadWrapper[]> {
    return this._payloads
  }

  /*
  async getMissingPayloads() {
    const payloadMap = await BoundWitnessWrapper.mapPayloads(await this.payloads())
    return this.payloadHashes.filter((hash) => !payloadMap[hash])
  }
  */

  getWrappedPayloads(): PayloadWrapper<Payload>[] {
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

  /*
  async payloadMap(): Promise<Record<string, Payload>> {
    this._payloadMap = this._payloadMap ?? (await BoundWitnessWrapper.mapPayloads(await this.payloads()))
    return this._payloadMap
  }
  */

  payloadWrappers(): PayloadWrapper[] {
    return Object.values(this._payloads ?? {})
  }

  payloads(): Payload[] {
    return this.getWrappedPayloads().map((wrapper) => wrapper.payload())
  }

  /*
  async payloadsByHashes<T extends Payload>(hashes: string[]): Promise<T[]> {
    const map = await this.payloadMap()
    return hashes.map<T>((hash) => assertEx(map[hash], 'Hash not found') as T)
  }
  */

  async payloadsBySchema<T extends Payload>(schema: string): Promise<T[]> {
    return (await this.payloads()).filter((payload) => payload.schema === schema) as T[]
  }

  prev(address: string) {
    return this.previousHashes[this.addresses.findIndex((addr) => address === addr)]
  }

  /*
  setPayloads(payloads: (TPayload | PayloadWrapper<TPayload>)[]) {
    this._payloadMap = undefined
    this._payloads = compact(payloads.map((payload) => PayloadWrapper.parse<TPayload>(payload)))
  }
  */

  toResult() {
    return [this.boundwitness, this.payloadWrappers().map((payload) => payload.body())]
  }

  override async validate(): Promise<Error[]> {
    return await new BoundWitnessValidator(this.boundwitness).validate()
  }
}
