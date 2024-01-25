import { toArrayBuffer, toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { Address, hexFromArrayBuffer } from '@xylabs/hex'
import { Logger } from '@xylabs/logger'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { BoundWitnessWrapper } from '@xyo-network/boundwitness-wrapper'
import { PayloadHasher, sortFields } from '@xyo-network/hash'
import { PayloadBuilder, PayloadWrapper } from '@xyo-network/payload'
import { ModuleError, Payload, WithMeta } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

export interface BoundWitnessBuilderConfig {
  /** Whether or not the payloads should be included in the metadata sent to and recorded by the ArchivistApi */
  /** @deprecated We will be removing support for inlinePayloads soon */
  readonly inlinePayloads?: boolean
  /** @deprecated We will be removing support for meta soon */
  readonly meta?: boolean
  /** @deprecated We will be removing support for timestamp soon */
  readonly timestamp?: boolean
}

export class BoundWitnessBuilder<TBoundWitness extends BoundWitness<{ schema: string }> = BoundWitness, TPayload extends Payload = Payload> {
  private static readonly _buildMutex = new Mutex()
  private _accounts: AccountInstance[] = []
  private _errorHashes: string[] | undefined
  private _errors: ModuleError[] = []
  private _payloadHashes: string[] | undefined
  private _payloadSchemas: string[] | undefined
  private _payloads: TPayload[] = []
  private _sourceQuery: string | undefined
  private _timestamp = Date.now()

  constructor(
    readonly config: BoundWitnessBuilderConfig = { inlinePayloads: false },
    protected readonly logger?: Logger,
  ) {}

  private get _payload_schemas(): string[] {
    return (
      this._payloadSchemas ??
      this._payloads.map((payload) => {
        return assertEx(payload.schema, () => this.missingSchemaMessage(payload))
      })
    )
  }

  static addressIndex<T extends BoundWitness>(payload: T, address: Address) {
    const index = payload.addresses.indexOf(address)
    if (index === -1) {
      throw new Error('Invalid address')
    }
    return index
  }

  static previousHash<T extends BoundWitness>(payload: T, address: Address) {
    return payload.previous_hashes[this.addressIndex(payload, address)]
  }

  static signature<T extends BoundWitness>(payload: T, address: Address) {
    return payload.$meta.signatures[this.addressIndex(payload, address)]
  }

  async build(meta = false): Promise<[WithMeta<TBoundWitness>, TPayload[], ModuleError[]]> {
    if (meta) {
      console.log('BoundWitnessBuilder: Calling build with meta=true will be disallowed soon')
    }
    return await BoundWitnessBuilder._buildMutex.runExclusive(async () => {
      const hashableFields = await this.hashableFields()
      const hash = (await PayloadBuilder.build(hashableFields)).$hash

      /* get all the previousHashes to verify atomic signing */
      const previousHashes = this._accounts.map((account) => account.previousHash)

      const meta =
        hashableFields.addresses.length > 0
          ? {
              $meta: {
                signatures: await this.signatures(hash, previousHashes),
              },
            }
          : {}

      const ret: WithMeta<TBoundWitness> = {
        ...hashableFields,
        $hash: hash,
        ...meta,
      }
      return [ret, this._payloads, this._errors]
    })
  }

  error(payload?: ModuleError) {
    const unwrappedPayload = PayloadWrapper.unwrap(payload)
    assertEx(this._errorHashes === undefined, 'Can not set errors when hashes already set')
    if (unwrappedPayload) {
      this._errors.push(assertEx(sortFields(unwrappedPayload)))
    }
    return this
  }

  errors(errors?: (ModuleError | null)[]) {
    for (const error of errors ?? []) {
      if (error !== null) {
        this.error(error)
      }
    }
    return this
  }

  async hashableFields(): Promise<TBoundWitness> {
    const addresses = this._accounts.map((account) =>
      account.addressBytes ? hexFromArrayBuffer(account.addressBytes, { prefix: false }) : undefined,
    )
    const previous_hashes = this._accounts.map((account) => account.previousHash ?? null)
    const payload_hashes = assertEx(await this.getPayloadHashes(), 'Missing payload_hashes')
    const payload_schemas = assertEx(this._payload_schemas, 'Missing payload_schemas')
    const result: TBoundWitness = {
      addresses: assertEx(addresses, 'Missing addresses'),
      payload_hashes,
      payload_schemas,
      previous_hashes,
      schema: BoundWitnessSchema,
    } as TBoundWitness

    assertEx(result.payload_hashes?.length === result.payload_schemas?.length, 'Payload hash/schema mismatch')

    assertEx(!result.payload_hashes.some((hash) => !hash), () => 'nulls found in hashes')

    assertEx(!result.payload_schemas.some((schema) => !schema), 'nulls found in schemas')

    if (this.config.timestamp ?? true) {
      result.timestamp = this._timestamp
    }

    if (this._sourceQuery) {
      result.sourceQuery = this._sourceQuery
    }

    return result
  }

  hashes(hashes: string[], schema: string[]) {
    assertEx(this.payloads.length === 0, 'Can not set hashes when payloads already set')
    this._payloadHashes = hashes
    this._payloadSchemas = schema
    return this
  }

  payload(payload?: TPayload) {
    const unwrappedPayload = PayloadWrapper.unwrap<TPayload>(payload)
    assertEx(this._payloadHashes === undefined, 'Can not set payloads when hashes already set')
    if (unwrappedPayload) {
      this._payloads.push(assertEx(sortFields<TPayload>(unwrappedPayload)))
    }
    return this
  }

  payloads(payloads?: (TPayload | null)[]) {
    if (payloads)
      for (const payload of payloads) {
        if (payload !== null) {
          this.payload(payload)
        }
      }
    return this
  }

  sourceQuery(hash?: string) {
    this._sourceQuery = hash
    return this
  }

  witness(account: AccountInstance) {
    this._accounts?.push(account)
    return this
  }

  witnesses(accounts: AccountInstance[]) {
    this._accounts?.push(...accounts)
    return this
  }

  protected async signatures(_hash: string, previousHashes: (string | ArrayBuffer | undefined)[]): Promise<string[]> {
    const hash = toArrayBuffer(_hash)
    const previousHashesBytes = previousHashes.map((ph) => (ph ? toUint8Array(ph) : undefined))
    return await Promise.all(this._accounts.map(async (account, index) => hexFromArrayBuffer(await account.sign(hash, previousHashesBytes[index]))))
  }

  private async getPayloadHashes(): Promise<string[]> {
    return this._payloadHashes ?? (await Promise.all(this._payloads.map(async (payload) => (await PayloadBuilder.build(payload)).$hash)))
  }

  private missingSchemaMessage(payload: Payload) {
    return `Builder: Missing Schema\n${JSON.stringify(payload, null, 2)}`
  }
}
