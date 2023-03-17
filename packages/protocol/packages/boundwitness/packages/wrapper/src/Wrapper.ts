import { assertEx } from '@xylabs/assert'
import { BoundWitness, BoundWitnessSchema, isBoundWitnessPayload } from '@xyo-network/boundwitness-model'
import { BoundWitnessValidator } from '@xyo-network/boundwitness-validator'
import { DataLike } from '@xyo-network/core'
import { Payload } from '@xyo-network/payload-model'
import { PayloadWrapper, PayloadWrapperBase } from '@xyo-network/payload-wrapper'
import compact from 'lodash/compact'

export class BoundWitnessWrapper<
  TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness,
  TPayload extends Payload = Payload,
> extends PayloadWrapperBase<TBoundWitness> {
  protected _payloads: Record<string, PayloadWrapper<TPayload>> | undefined
  private isBoundWitnessWrapper = true

  constructor(boundwitness: TBoundWitness, payloads?: (TPayload | PayloadWrapper<TPayload> | null)[]) {
    super(boundwitness)
    this.payloads = payloads ? compact(payloads) : undefined
  }

  get addresses() {
    return this.boundwitness.addresses
  }

  get boundwitness() {
    return this.obj
  }

  override get errors() {
    return new BoundWitnessValidator(this.boundwitness).validate()
  }

  get missingPayloads() {
    return this.payloadHashes.filter((hash) => !this.payloads[hash])
  }

  get payloadHashes() {
    return this.boundwitness.payload_hashes
  }

  get payloadSchemas() {
    return this.boundwitness.payload_schemas
  }

  get payloads(): Record<string, PayloadWrapper<TPayload>> {
    return this._payloads ?? {}
  }

  set payloads(payloads: Record<string, PayloadWrapper<TPayload>> | (TPayload | PayloadWrapper<TPayload>)[] | undefined) {
    if (Array.isArray(payloads)) {
      this._payloads = payloads?.reduce((map, payload) => {
        const wrapper = PayloadWrapper.parse<TPayload>(payload)
        map[wrapper.hash] = wrapper
        return map
      }, {} as Record<string, PayloadWrapper<TPayload>>)
    } else {
      this._payloads = payloads
    }
    if (this?._payloads) {
      this._payloads = Object.fromEntries(
        this.payloadHashes.reduce<[string, PayloadWrapper<TPayload>][]>((prev, hash) => {
          const existing = this._payloads?.[hash]
          if (existing) prev.push([hash, existing])
          return prev
        }, []),
      )
    }
  }

  get payloadsArray(): PayloadWrapper<TPayload>[] {
    return Object.values(this._payloads ?? {})
  }

  get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  static override async load(address: DataLike) {
    const payload = await PayloadWrapper.load(address)
    assertEx(payload && isBoundWitnessPayload(payload), 'Attempt to load non-boundwitness')

    const boundWitness: BoundWitness | undefined = payload && isBoundWitnessPayload(payload) ? payload : undefined
    return boundWitness ? new BoundWitnessWrapper(boundWitness) : null
  }

  static override parse<T extends BoundWitness = BoundWitness, P extends Payload = Payload>(obj: unknown, payloads?: P[]): BoundWitnessWrapper<T, P> {
    const hydratedObj = typeof obj === 'string' ? JSON.parse(obj) : obj
    assertEx(!Array.isArray(hydratedObj), 'Array can not be converted to BoundWitnessWrapper')
    switch (typeof hydratedObj) {
      case 'object': {
        const castWrapper = hydratedObj as BoundWitnessWrapper<T, P>
        const newWrapper = castWrapper?.isBoundWitnessWrapper ? castWrapper : new BoundWitnessWrapper(hydratedObj as T, payloads)
        if (!newWrapper.valid) {
          console.warn('Wrapped invalid BoundWitness')
        }
        return newWrapper
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }

  dig(depth?: number): BoundWitnessWrapper<TBoundWitness> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.findIndex((item) => item === BoundWitnessSchema)
    if (innerBoundwitnessIndex > -1) {
      const innerBoundwitnessHash: string = this.payloadHashes[innerBoundwitnessIndex]
      const innerBoundwitnessPayload = this.payloads[innerBoundwitnessHash]
      const innerBoundwitness: BoundWitnessWrapper<TBoundWitness> | undefined = innerBoundwitnessPayload
        ? new BoundWitnessWrapper<TBoundWitness>(
            innerBoundwitnessPayload.body as unknown as TBoundWitness,
            this.payloadsArray.filter((payload) => payload.hash !== innerBoundwitnessHash).map((item) => item.body as unknown as TBoundWitness),
          )
        : undefined
      if (innerBoundwitness) {
        return innerBoundwitness.dig(depth ? depth - 1 : undefined)
      }
    }
    assertEx(!depth, `Dig failed [Remaining Depth: ${depth}]`)
    return this
  }

  payloadsBySchema(schema: string) {
    return Object.values(this.payloads)?.filter((payload) => payload.schemaName === schema)
  }

  prev(address: string) {
    return this.previousHashes[this.addresses.findIndex((addr) => address === addr)]
  }

  toResult() {
    return [this.boundwitness, this.payloadsArray.map((payload) => payload.body)]
  }
}
