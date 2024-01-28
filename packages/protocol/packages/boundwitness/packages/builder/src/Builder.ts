import { toArrayBuffer, toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { Address, Hash, hexFromArrayBuffer } from '@xylabs/hex'
import { JsonObject } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { sortFields } from '@xyo-network/hash'
import { PayloadBuilder, PayloadBuilderBase, PayloadBuilderOptions, PayloadWrapper } from '@xyo-network/payload'
import { ModuleError, Payload, Schema, WithMeta } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

type GeneratedBoundWitnessFields = 'addresses' | 'payload_hashes' | 'payload_schemas' | 'previous_hashes'

export interface BoundWitnessBuilderOptions<T extends BoundWitness = BoundWitness, TPayload extends Payload = Payload>
  extends Omit<PayloadBuilderOptions<Omit<T, GeneratedBoundWitnessFields>>, 'schema'> {
  readonly accounts?: AccountInstance[]
  readonly payloadHashes?: T['payload_hashes']
  readonly payloadSchemas?: T['payload_schemas']
  readonly payloads?: TPayload[]
  readonly sourceQuery?: Hash
  readonly timestamp?: boolean | number
}

export class BoundWitnessBuilder<T extends BoundWitness = BoundWitness, TPayload extends Payload = Payload> extends PayloadBuilderBase<
  Omit<T, GeneratedBoundWitnessFields>,
  BoundWitnessBuilderOptions<T> & { schema: BoundWitnessSchema }
> {
  private static readonly _buildMutex = new Mutex()
  private _accounts: AccountInstance[]
  private _errorHashes?: string[]
  private _errors: ModuleError[] = []
  private _payloadHashes?: string[]
  private _payloadSchemas?: string[]
  private _payloads: TPayload[]
  private _sourceQuery?: Hash
  private _timestamp: boolean | number

  constructor(options?: BoundWitnessBuilderOptions<T, TPayload>) {
    super({ ...options, schema: BoundWitnessSchema })
    const { accounts, payloadHashes, payloadSchemas, payloads, sourceQuery, timestamp } = options ?? {}
    this._accounts = accounts ?? []
    this._payloadHashes = payloadHashes
    this._payloadSchemas = payloadSchemas
    this._payloads = payloads ?? []
    this._sourceQuery = sourceQuery
    this._timestamp = timestamp ?? true
  }

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

  async build(): Promise<[WithMeta<T>, TPayload[], ModuleError[]]> {
    return await BoundWitnessBuilder._buildMutex.runExclusive(async () => {
      const hashableFields = await this.hashableFields()
      const hash = (await PayloadBuilder.build(hashableFields)).$hash

      /* get all the previousHashes to verify atomic signing */
      const previousHashes = this._accounts.map((account) => account.previousHash)

      const metaHolder: { $meta?: JsonObject } = {}

      if (hashableFields.addresses.length > 0) {
        metaHolder.$meta = metaHolder.$meta ?? {}
        metaHolder.$meta.signatures = await this.signatures(hash, previousHashes)
      }

      if (this._sourceQuery) {
        metaHolder.$meta = metaHolder.$meta ?? {}
        metaHolder.$meta.sourceQuery = this._sourceQuery
      }

      const ret: WithMeta<T> = {
        ...hashableFields,
        $hash: hash,
        ...metaHolder,
      }
      return [ret, this._payloads, this._errors]
    })
  }

  async error(payload?: ModuleError) {
    const unwrappedPayload = await PayloadWrapper.unwrap(payload)
    assertEx(this._errorHashes === undefined, 'Can not set errors when hashes already set')
    if (unwrappedPayload) {
      this._errors.push(assertEx(sortFields(unwrappedPayload)))
    }
    return this
  }

  async errors(errors?: (ModuleError | null)[]) {
    if (errors) {
      await Promise.all(
        errors.map(async (error) => {
          if (error !== null) {
            await this.error(error)
          }
        }),
      )
    }
    return this
  }

  override async hashableFields(): Promise<T> {
    const addresses = this._accounts.map((account) => hexFromArrayBuffer(account.addressBytes, { prefix: false }))
    const previous_hashes = this._accounts.map((account) => account.previousHash ?? null)
    const payload_hashes = assertEx(await this.getPayloadHashes(), 'Missing payload_hashes')
    const payload_schemas = assertEx(this._payload_schemas, 'Missing payload_schemas')
    const result: T = {
      ...(await super.hashableFields()),
      addresses,
      payload_hashes,
      payload_schemas,
      previous_hashes,
    } as T

    assertEx(result.payload_hashes?.length === result.payload_schemas?.length, 'Payload hash/schema mismatch')

    assertEx(!result.payload_hashes.some((hash) => !hash), () => 'nulls found in hashes')

    assertEx(!result.payload_schemas.some((schema) => !schema), 'nulls found in schemas')

    if (typeof this._timestamp === 'number') {
      result.timestamp = this._timestamp
    } else if (this._timestamp) {
      result.timestamp = Date.now()
    }

    return result
  }

  hashes(hashes: Hash[], schema: Schema[]) {
    assertEx(this.payloads.length === 0, 'Can not set hashes when payloads already set')
    this._payloadHashes = hashes
    this._payloadSchemas = schema
    return this
  }

  async payload(payload?: TPayload) {
    const unwrappedPayload = await PayloadWrapper.unwrap<TPayload>(payload)
    assertEx(this._payloadHashes === undefined, 'Can not set payloads when hashes already set')
    if (unwrappedPayload) {
      this._payloads.push(assertEx(sortFields<TPayload>(unwrappedPayload)))
    }
    return this
  }

  async payloads(payloads?: (TPayload | null)[]) {
    if (payloads)
      await Promise.all(
        payloads.map(async (payload) => {
          if (payload !== null) {
            await this.payload(payload)
          }
        }),
      )
    return this
  }

  sourceQuery(query?: Hash) {
    this._sourceQuery = query
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

  protected async signatures(_hash: Hash, previousHashes: (Hash | ArrayBuffer | undefined)[]): Promise<string[]> {
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
