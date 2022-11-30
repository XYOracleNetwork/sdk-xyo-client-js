import { assertEx } from '@xylabs/assert'
import { DataLike } from '@xyo-network/core'
import { Huri, PayloadWrapper, PayloadWrapperBase, XyoPayload } from '@xyo-network/payload'
import compact from 'lodash/compact'

import { isXyoBoundWitnessPayload } from '../isXyoPayloadOfSchemaType'
import { XyoBoundWitness, XyoBoundWitnessSchema } from '../models'
import { BoundWitnessValidator } from '../Validator'

export class BoundWitnessWrapper<
  TBoundWitness extends XyoBoundWitness<{ schema: string }> = XyoBoundWitness,
  TPayload extends XyoPayload = XyoPayload,
> extends PayloadWrapperBase<TBoundWitness> {
  protected _payloads: Record<string, PayloadWrapper<TPayload>> | undefined
  private isBoundWitnessWrapper = true

  constructor(boundwitness: TBoundWitness, payloads?: (TPayload | PayloadWrapper<TPayload> | null)[]) {
    super(boundwitness)
    this.payloads = payloads ? compact(payloads) : undefined
  }

  public get addresses() {
    return this.boundwitness.addresses
  }

  public get boundwitness() {
    return this.obj
  }

  override get errors() {
    return new BoundWitnessValidator(this.boundwitness).validate()
  }

  public get missingPayloads() {
    return this.payloadHashes.filter((hash) => !this.payloads[hash])
  }

  public get payloadHashes() {
    return this.boundwitness.payload_hashes
  }

  public get payloadSchemas() {
    return this.boundwitness.payload_schemas
  }

  public get payloads(): Record<string, PayloadWrapper<TPayload>> {
    return this._payloads ?? {}
  }

  public set payloads(payloads: Record<string, PayloadWrapper<TPayload>> | (TPayload | PayloadWrapper<TPayload>)[] | undefined) {
    if (Array.isArray(payloads)) {
      this._payloads = payloads?.reduce((map, payload) => {
        const wrapper = PayloadWrapper.parse<TPayload>(payload)
        map[wrapper.hash] = wrapper
        return map
      }, {} as Record<string, PayloadWrapper<TPayload>>)
    } else {
      this._payloads = payloads
    }
  }

  public get payloadsArray(): PayloadWrapper<TPayload>[] {
    return Object.values(this._payloads ?? {})
  }

  public get previousHashes() {
    return this.boundwitness.previous_hashes
  }

  public static override async load(address: DataLike | Huri) {
    const payload = await new Huri(address).fetch()
    assertEx(payload && isXyoBoundWitnessPayload(payload), 'Attempt to load non-boundwitness')

    const boundWitness: XyoBoundWitness | undefined = payload && isXyoBoundWitnessPayload(payload) ? payload : undefined
    return boundWitness ? new BoundWitnessWrapper(boundWitness) : null
  }

  public static override parse<T extends XyoBoundWitness = XyoBoundWitness, P extends XyoPayload = XyoPayload>(
    obj: unknown,
  ): BoundWitnessWrapper<T, P> {
    assertEx(!Array.isArray(obj), 'Array can not be converted to BoundWitnessWrapper')
    switch (typeof obj) {
      case 'object': {
        const castWrapper = obj as BoundWitnessWrapper<T, P>
        return castWrapper?.isBoundWitnessWrapper ? castWrapper : new BoundWitnessWrapper(obj as T)
      }
    }
    throw Error(`Unable to parse [${typeof obj}]`)
  }

  public dig(depth?: number): BoundWitnessWrapper<TBoundWitness> {
    if (depth === 0) return this

    const innerBoundwitnessIndex: number = this.payloadSchemas.findIndex((item) => item === XyoBoundWitnessSchema)
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

  public payloadsBySchema(schema: string) {
    return Object.values(this.payloads)?.filter((payload) => payload.schemaName === schema)
  }

  public prev(address: string) {
    return this.previousHashes[this.addresses.findIndex((addr) => address === addr)]
  }

  public toResult() {
    return [this.boundwitness, this.payloadsArray.map((payload) => payload.body)]
  }
}

/** @deprecated use BoundWitnessWrapper instead*/
export class XyoBoundWitnessWrapper<T extends XyoBoundWitness> extends BoundWitnessWrapper<T> {}
