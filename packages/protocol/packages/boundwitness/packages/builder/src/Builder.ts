import { toArrayBuffer, toUint8Array } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import { Address, Hash, hexFromArrayBuffer } from '@xylabs/hex'
import { AnyObject, JsonObject } from '@xylabs/object'
import { AccountInstance } from '@xyo-network/account-model'
import { BoundWitness, BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import { removeEmptyFields, sortFields } from '@xyo-network/hash'
import { PayloadBuilder, PayloadBuilderBase, PayloadBuilderOptions, PayloadWrapper } from '@xyo-network/payload'
import { ModuleError, Payload, Schema, WithMeta } from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

export type GeneratedBoundWitnessFields = 'addresses' | 'payload_hashes' | 'payload_schemas' | 'previous_hashes'

export interface BoundWitnessBuilderOptions<TBoundWitness extends BoundWitness = BoundWitness, TPayload extends Payload = Payload>
  extends Omit<PayloadBuilderOptions<Omit<TBoundWitness, GeneratedBoundWitnessFields>>, 'schema'> {
  readonly accounts?: AccountInstance[]
  readonly destination?: string[]
  readonly payloadHashes?: TBoundWitness['payload_hashes']
  readonly payloadSchemas?: TBoundWitness['payload_schemas']
  readonly payloads?: TPayload[]
  readonly sourceQuery?: Hash
  readonly timestamp?: number
}

export class BoundWitnessBuilder<TBoundWitness extends BoundWitness = BoundWitness, TPayload extends Payload = Payload> extends PayloadBuilderBase<
  Omit<TBoundWitness, GeneratedBoundWitnessFields>,
  BoundWitnessBuilderOptions<TBoundWitness> & { schema: BoundWitnessSchema }
> {
  private static readonly _buildMutex = new Mutex()
  private _accounts: AccountInstance[]
  private _destination?: string[]
  private _errorHashes?: string[]
  private _errors: ModuleError[] = []
  private _payloadHashes?: string[]
  private _payloadSchemas?: string[]
  private _payloads: TPayload[]
  private _sourceQuery?: Hash
  private _timestamp: boolean | number

  constructor(options?: BoundWitnessBuilderOptions<TBoundWitness, TPayload>) {
    super({ ...options, schema: BoundWitnessSchema })
    const { accounts, payloadHashes, payloadSchemas, payloads, sourceQuery, timestamp, destination } = options ?? {}
    this._accounts = accounts ?? []
    this._payloadHashes = payloadHashes
    this._payloadSchemas = payloadSchemas
    this._payloads = payloads ?? []
    this._sourceQuery = sourceQuery
    this._destination = destination
    this._timestamp = timestamp ?? true
  }

  protected get addresses(): Address[] {
    return this._accounts.map((account) => account.address.toLowerCase())
  }

  protected get payloadSchemas(): string[] {
    return (
      this._payloadSchemas ??
      this._payloads.map((payload) => {
        return assertEx(payload.schema, () => this.missingSchemaMessage(payload))
      })
    )
  }

  protected get previousHashBuffers(): (ArrayBuffer | null)[] {
    return this._accounts.map((account) => account.previousHashBytes ?? null)
  }

  protected get previousHashes(): (Hash | null)[] {
    return this._accounts.map((account) => account.previousHash ?? null)
  }

  protected get timestamp(): number {
    return (this._timestamp = typeof this._timestamp === 'number' ? this._timestamp : Date.now())
  }

  static addressIndex<T extends BoundWitness>(payload: T, address: Address) {
    const index = payload.addresses.indexOf(address)
    if (index === -1) {
      throw new Error('Invalid address')
    }
    return index
  }

  static async build<TBoundWitness extends BoundWitness>(options: BoundWitnessBuilderOptions<TBoundWitness>) {
    return await new BoundWitnessBuilder(options).build()
  }

  static override async dataHashableFields<T extends Payload = Payload<AnyObject>>(
    schema: string,
    fields?: Omit<T, 'schema' | '$hash' | '$meta'>,
  ): Promise<Omit<T, '$hash' | '$meta'>> {
    return await PayloadBuilderBase.dataHashableFields(schema, fields ? removeEmptyFields(fields) : undefined)
  }

  static override async hashableFields<T extends Payload = Payload<AnyObject>>(
    schema: string,
    fields?: Omit<T, 'schema' | '$hash' | '$meta'>,
    $meta?: JsonObject,
    $hash?: Hash,
    timestamp?: number,
  ): Promise<WithMeta<T>> {
    return await PayloadBuilderBase.hashableFields(schema, fields, $meta, $hash, timestamp)
  }

  static previousHash<T extends BoundWitness>(boundWitness: T, address: Address) {
    return boundWitness.previous_hashes[this.addressIndex(boundWitness, address)]?.toLowerCase()
  }

  protected static async linkingFields<T extends BoundWitness = BoundWitness>(
    accounts: AccountInstance[],
    payloads?: Payload[],
    timestamp = Date.now(),
  ) {
    const addresses = accounts.map((account) => hexFromArrayBuffer(account.addressBytes, { prefix: false }))
    const previous_hashes = accounts.map((account) => account.previousHash ?? null)
    const payload_hashes = payloads ? await PayloadBuilder.dataHashes(payloads) : []
    const payload_schemas = payloads?.map(({ schema }) => schema)
    return { addresses, payload_hashes, payload_schemas, previous_hashes, timestamp } as Omit<T, '$meta' | '$hash' | 'schema'>
  }

  protected static override async metaFields(
    dataHash: Hash,
    otherMeta?: JsonObject,
    accounts?: AccountInstance[],
    previousHashes?: (Hash | null)[],
    destination?: Address[],
    sourceQuery?: Hash,
  ): Promise<JsonObject> {
    const meta: JsonObject = { ...(await PayloadBuilderBase.metaFields(dataHash, otherMeta)) }

    if (accounts?.length && previousHashes?.length) {
      assertEx(accounts.length === previousHashes.length, 'accounts and previousHashes must have same length')
      meta.signatures = await this.signatures(accounts, dataHash, previousHashes)
    }

    if (sourceQuery) {
      meta.sourceQuery = sourceQuery
    }

    if (destination) {
      meta.destination = destination
    }

    return meta
  }

  protected static signature<T extends BoundWitness>(payload: T, address: Address) {
    return payload.$meta.signatures[this.addressIndex(payload, address)]
  }

  protected static async signatures(accounts: AccountInstance[], hash: Hash, previousHashes: (Hash | ArrayBuffer | null)[]): Promise<string[]> {
    const hashBytes = toArrayBuffer(hash)
    const previousHashesBytes = previousHashes?.map((ph) => (ph ? toUint8Array(ph) : undefined))
    return await Promise.all(accounts.map(async (account, index) => hexFromArrayBuffer(await account.sign(hashBytes, previousHashesBytes[index]))))
  }

  private static validateLinkingFields(bw: Pick<BoundWitness, 'payload_hashes' | 'payload_schemas'>) {
    assertEx(bw.payload_hashes?.length === bw.payload_schemas?.length, 'Payload hash/schema mismatch')
    assertEx(!bw.payload_hashes.some((hash) => !hash), () => 'nulls found in hashes')
    assertEx(!bw.payload_schemas.some((schema) => !schema), 'nulls found in schemas')
  }

  async build(): Promise<[WithMeta<TBoundWitness>, WithMeta<TPayload>[], WithMeta<ModuleError>[]]> {
    return await BoundWitnessBuilder._buildMutex.runExclusive(async () => {
      const dataHashableFields = (await this.dataHashableFields()) as TBoundWitness
      const $hash = (await PayloadBuilder.build(dataHashableFields)).$hash
      const $meta = await this.metaFields($hash)

      const ret = {
        ...dataHashableFields,
        $hash,
        $meta,
      } as WithMeta<TBoundWitness>
      return [
        ret,
        await Promise.all(this._payloads?.map((payload) => PayloadBuilder.build(payload))),
        await Promise.all(this._errors?.map((error) => PayloadBuilder.build(error))),
      ]
    })
  }

  override async dataHashableFields(): Promise<Omit<TBoundWitness, '$meta' | '$hash'>> {
    const fields = await this.linkingFields()
    const result = await BoundWitnessBuilder.dataHashableFields<TBoundWitness>(this._schema, fields)

    BoundWitnessBuilder.validateLinkingFields(result)

    return result as Omit<TBoundWitness, '$meta' | '$hash'>
  }

  async error(payload?: ModuleError) {
    const unwrappedPayload = PayloadWrapper.unwrap(payload)
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

  hashes(hashes: Hash[], schema: Schema[]) {
    assertEx(this.payloads.length === 0, 'Can not set hashes when payloads already set')
    this._payloadHashes = hashes
    this._payloadSchemas = schema
    return this
  }

  async payload(payload?: TPayload) {
    const unwrappedPayload = PayloadWrapper.unwrap<TPayload>(payload)
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
    this._sourceQuery = query?.toLowerCase()
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

  protected override async metaFields(dataHash: Hash): Promise<JsonObject> {
    return await BoundWitnessBuilder.metaFields(dataHash, this._$meta, this._accounts, this.previousHashes, this._destination, this._sourceQuery)
  }

  protected async signatures(_hash: Hash, previousHashes: (Hash | ArrayBuffer | null)[]): Promise<string[]> {
    const hash = toArrayBuffer(_hash)
    const previousHashesBytes = previousHashes.map((ph) => (ph ? toUint8Array(ph) : undefined))
    return await Promise.all(this._accounts.map(async (account, index) => hexFromArrayBuffer(await account.sign(hash, previousHashesBytes[index]))))
  }

  private async linkingFields() {
    return await BoundWitnessBuilder.linkingFields<TBoundWitness>(this._accounts, this._payloads, this.timestamp)
  }

  private missingSchemaMessage(payload: Payload) {
    return `Builder: Missing Schema\n${JSON.stringify(payload, null, 2)}`
  }
}
