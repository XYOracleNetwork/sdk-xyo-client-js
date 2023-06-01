import { assertEx } from '@xylabs/assert'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { Payload } from '@xyo-network/payload-model'
import { creatableWrapper, PayloadWrapper } from '@xyo-network/payload-wrapper'

creatableWrapper()
export class BoundWitnessWrapper<TBoundWitness extends BoundWitness = BoundWitness> extends PayloadWrapper<TBoundWitness> {
  private payloads: Payload[] = []

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

  static override is(obj: unknown) {
    return obj instanceof BoundWitnessWrapper
  }

  /*async dig(depth?: number): Promise<BoundWitnessWrapper<TBoundWitness>> {
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
  }*/

  async getMissingPayloads() {
    const payloadMap = await PayloadWrapper.mapPayloads(this.payloads)
    return this.payloadHashes.filter((hash) => !payloadMap[hash])
  }

  getWrappedPayloads(): PayloadWrapper[] {
    return PayloadWrapper.wrapMany(Object.values(this.payloads))
  }

  hashesBySchema(schema: string) {
    return this.payloadSchemas.reduce<string[]>((prev, payloadSchema, index) => {
      if (payloadSchema === schema) {
        prev.push(this.payloadHashes[index])
      }
      return prev
    }, [])
  }

  async payloadMap(payloads?: Payload[]): Promise<Record<string, PayloadWrapper>> {
    const pairs = await PayloadWrapper.hashPairs(payloads ?? [])
    const result: Record<string, PayloadWrapper> = {}
    pairs.forEach(([payload, hash]) => {
      result[hash] = PayloadWrapper.wrap(payload)
    })
    return result
  }

  async payloadsByHashes(hashes: string[]): Promise<PayloadWrapper[]> {
    const map = await this.payloadMap()
    return hashes.map<PayloadWrapper>((hash) => assertEx(map[hash], 'Hash not found'))
  }

  payloadsBySchema<T extends Payload>(schema: string): T[] {
    return this.payloads.filter((payload) => payload.schema === schema) as T[]
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
    return [this.boundwitness, this.getWrappedPayloads().map((payload) => payload.body())]
  }

  override async validate(): Promise<Error[]> {
    return await new BoundWitnessValidator(this.boundwitness).validate()
  }
}
