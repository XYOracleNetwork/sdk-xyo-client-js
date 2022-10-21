import { assertEx } from '@xylabs/assert'
import { Buffer } from '@xylabs/buffer'
import { XyoAccount } from '@xyo-network/account'
import { Hasher, sortFields } from '@xyo-network/core'
import { XyoPayload } from '@xyo-network/payload'

import { XyoBoundWitness, XyoBoundWitnessSchema } from '../models'
import { BoundWitnessWrapper } from '../Wrapper'

export interface BoundWitnessBuilderConfig {
  /** Whether or not the payloads should be included in the metadata sent to and recorded by the ArchivistApi */
  readonly inlinePayloads?: boolean
  readonly timestamp?: boolean
  readonly meta?: boolean
}

/** @deprecated use BoundWitnessBuilderConfig instead */
export type XyoBoundWitnessBuilderConfig = BoundWitnessBuilderConfig

export class BoundWitnessBuilder<
  TBoundWitness extends XyoBoundWitness<{ schema: string }> = XyoBoundWitness,
  TPayload extends XyoPayload = XyoPayload,
> {
  private _accounts: XyoAccount[] = []
  private _payloads: TPayload[] = []
  private _payloadHashes: string[] | undefined
  private _payloadSchemas: string[] | undefined
  private _timestamp = Date.now()

  constructor(public readonly config: BoundWitnessBuilderConfig = { inlinePayloads: false }) {}

  private get _payload_hashes(): string[] {
    return (
      this._payloadHashes ??
      this._payloads.map((payload) => {
        return assertEx(new Hasher(payload).hash)
      })
    )
  }

  private get _payload_schemas(): string[] {
    return (
      this._payloadSchemas ??
      this._payloads.map((payload) => {
        return assertEx(payload.schema)
      })
    )
  }

  public witness(account: XyoAccount) {
    this._accounts?.push(account)
    return this
  }

  public payloads(payloads?: (TPayload | null)[]) {
    payloads?.forEach((payload) => {
      if (payload !== null) {
        this.payload(payload)
      }
    })
    return this
  }

  public hashes(hashes: string[], schema: string[]) {
    assertEx(this.payloads.length === 0, 'Can not set hashes when payloads already set')
    this._payloadHashes = hashes
    this._payloadSchemas = schema
    return this
  }

  public payload(payload?: TPayload) {
    assertEx(this._payloadHashes === undefined, 'Can not set payloads when hashes already set')
    if (payload) {
      this._payloads.push(assertEx(sortFields<TPayload>(payload)))
    }
    return this
  }

  public hashableFields(): TBoundWitness {
    const addresses = this._accounts.map((account) => account.addressValue.hex)
    const previous_hashes = this._accounts.map((account) => account.previousHash?.hex ?? null)
    const result: TBoundWitness = {
      addresses: assertEx(addresses, 'Missing addresses'),
      payload_hashes: assertEx(this._payload_hashes, 'Missing payload_hashes'),
      payload_schemas: assertEx(this._payload_schemas, 'Missing payload_schemas'),
      previous_hashes,
      schema: XyoBoundWitnessSchema,
    } as TBoundWitness

    assertEx(result.payload_hashes?.length === result.payload_schemas?.length, 'Payload hash/schema mismatch')

    assertEx(!result.payload_hashes.reduce((inValid, hash) => inValid || !hash, false), 'nulls found in hashes')

    assertEx(!result.payload_schemas.reduce((inValid, schema) => inValid || !schema, false), 'nulls found in schemas')

    if (this.config.timestamp ?? true) {
      result.timestamp = this._timestamp
    }
    return result
  }

  protected signatures(_hash: string) {
    return this._accounts.map((account) => Buffer.from(account.sign(Buffer.from(_hash, 'hex'))).toString('hex'))
  }

  private inlinePayloads() {
    return this._payloads.map<TPayload>((payload, index) => {
      return {
        ...payload,
        schema: this._payload_schemas[index],
      }
    })
  }

  public build(): [TBoundWitness, TPayload[]] {
    const hashableFields = this.hashableFields()
    const _hash = BoundWitnessWrapper.hash(hashableFields)

    const ret: TBoundWitness = {
      ...hashableFields,
      _signatures: this.signatures(_hash),
    }

    if (this.config?.meta ?? true) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bwWithMeta = ret as any
      bwWithMeta._client = 'js'
      bwWithMeta._hash = _hash
      bwWithMeta._timestamp = this._timestamp
    }

    if (this.config.inlinePayloads) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anyRet = ret as any
      //leaving this in here to prevent breaking code (for now)
      anyRet._payloads = this.inlinePayloads()
    }
    return [ret, this._payloads]
  }
}

/** @deprecated use BoundWitnessBuilder instead */
export class XyoBoundWitnessBuilder extends BoundWitnessBuilder {}
