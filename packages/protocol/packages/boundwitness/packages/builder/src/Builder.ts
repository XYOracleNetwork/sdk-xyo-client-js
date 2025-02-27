import { toArrayBuffer } from '@xylabs/arraybuffer'
import { assertEx } from '@xylabs/assert'
import type { Address, Hash } from '@xylabs/hex'
import { hexFromArrayBuffer } from '@xylabs/hex'
import type { AccountInstance } from '@xyo-network/account-model'
import type {
  BoundWitness,
  Signed,
  UnsignedBoundWitness,
} from '@xyo-network/boundwitness-model'
import { BoundWitnessSchema } from '@xyo-network/boundwitness-model'
import {
  ObjectHasher, removeEmptyFields, sortFields,
} from '@xyo-network/hash'
import type { PayloadBuilderOptions } from '@xyo-network/payload-builder'
import { omitSchema, PayloadBuilder } from '@xyo-network/payload-builder'
import type {
  AnyPayload,
  ModuleError, Payload, Schema, WithoutMeta,
  WithoutSchema,
} from '@xyo-network/payload-model'
import { Mutex } from 'async-mutex'

export const GeneratedBoundWitnessFields = ['addresses', 'payload_hashes', 'payload_schemas', 'previous_hashes'] as const
export type GeneratedBoundWitnessFields = typeof GeneratedBoundWitnessFields[number]

const uniqueAccounts = (accounts: AccountInstance[], throwOnFalse = false) => {
  const addresses = new Set<Address>()
  for (const account of accounts) {
    if (addresses.has(account.address)) {
      if (throwOnFalse) {
        throw new Error('Duplicate address')
      }
      return false
    }
    addresses.add(account.address)
  }
  return true
}

export class BoundWitnessBuilder<
  TBoundWitness extends UnsignedBoundWitness = UnsignedBoundWitness,
  TPayload extends Payload = AnyPayload>
  extends PayloadBuilder<
    TBoundWitness,
    Promise<[Signed<TBoundWitness>, TPayload[], ModuleError[]]>
  > {
  private static readonly _buildMutex = new Mutex()

  private _accounts: AccountInstance[] = []
  private _errorHashes?: Hash[]
  private _errors: ModuleError[] = []
  private _payloadHashes?: Hash[]
  private _payloadSchemas?: Schema[]
  private _payloads: TPayload[] = []

  constructor(options?: Omit<PayloadBuilderOptions, 'schema'>) {
    super({ ...options, schema: BoundWitnessSchema })
  }

  protected get addresses(): Address[] {
    uniqueAccounts(this._accounts, true)
    return this._accounts.map(account => account.address.toLowerCase()) as Address[]
  }

  protected get payloadSchemas(): string[] {
    return (
      this._payloadSchemas
      ?? this._payloads.map((payload) => {
        return assertEx(payload.schema, () => this.missingSchemaMessage(payload))
      })
    )
  }

  protected get previousHashBytes(): (ArrayBufferLike | null)[] {
    return this._accounts.map(account => account.previousHashBytes ?? null)
  }

  protected get previousHashes(): (Hash | null)[] {
    return this._accounts.map(account => account.previousHash ?? null)
  }

  static addressIndex<T extends BoundWitness>(payload: T, address: Address) {
    const index = payload.addresses.indexOf(address)
    if (index === -1) {
      throw new Error('Invalid address')
    }
    return index
  }

  static previousHash<T extends BoundWitness>(boundWitness: T, address: Address) {
    return boundWitness.previous_hashes[this.addressIndex(boundWitness, address)]?.toLowerCase()
  }

  protected static async linkingFields<T extends BoundWitness>(
    accounts: AccountInstance[],
    payloads?: Payload[],
  ): Promise<Pick<T, GeneratedBoundWitnessFields>> {
    const addresses = accounts.map(account => hexFromArrayBuffer(account.addressBytes, { prefix: false }))
    const previous_hashes = accounts.map(account => account.previousHash ?? null)
    const payload_hashes = payloads ? await BoundWitnessBuilder.hashes(payloads) : []
    const payload_schemas = payloads?.map(({ schema }) => schema) ?? []
    return {
      addresses, payload_hashes, payload_schemas, previous_hashes,
    }
  }

  protected static signature<T extends BoundWitness>(payload: T, address: Address) {
    return payload.$signatures[this.addressIndex(payload, address)]
  }

  protected static async signatures(accounts: AccountInstance[], dataHash: Hash): Promise<string[]> {
    const hashBytes = toArrayBuffer(dataHash)
    const previousHashesBytes = accounts?.map(account => account.previousHashBytes)
    return await Promise.all(accounts.map(async (account, index) => hexFromArrayBuffer((await account.sign(hashBytes, previousHashesBytes[index]))[0])))
  }

  private static validateGeneratedFields(fields: Pick<BoundWitness, GeneratedBoundWitnessFields>) {
    assertEx(fields.payload_hashes?.length === fields.payload_schemas?.length, () => 'Payload hash/schema mismatch')
    assertEx(!fields.payload_hashes.some(hash => !hash), () => 'nulls found in hashes')
    assertEx(!fields.payload_schemas.some(schema => !schema), () => 'nulls found in schemas')
  }

  override async build(): Promise<[Signed<TBoundWitness>, TPayload[], ModuleError[]]> {
    return await BoundWitnessBuilder._buildMutex.runExclusive(async () => {
      const dataHashableFields = (await this.dataHashableFields()) as TBoundWitness
      const $signatures = await this.sign()

      const ret = {
        ...this._meta, ...dataHashableFields, $signatures,
      } as Signed<TBoundWitness>
      return [
        ret,
        this._payloads,
        this._errors,
      ]
    })
  }

  async dataHash() {
    const dataHashableFields = await this.dataHashableFields()
    const hash = await ObjectHasher.hash(dataHashableFields)
    return hash
  }

  override async dataHashableFields() {
    const generatedFields: Pick<TBoundWitness, GeneratedBoundWitnessFields> = await this.generatedFields()
    BoundWitnessBuilder.validateGeneratedFields(generatedFields)
    const fields: WithoutSchema<TBoundWitness> = {
      ...this._fields,
      ...generatedFields,
    } as WithoutSchema<TBoundWitness>
    return await BoundWitnessBuilder.dataHashableFields<TBoundWitness>(this._schema, fields)
  }

  error(payload?: ModuleError) {
    assertEx(this._errorHashes === undefined, () => 'Can not set errors when hashes already set')
    if (payload) {
      this._errors.push(assertEx(sortFields(payload)))
    }
    return this
  }

  errors(errors?: (ModuleError | null)[]) {
    if (errors) {
      for (const error of errors) {
        if (error !== null) {
          this.error(error)
        }
      }
    }
    return this
  }

  override fields(fields: WithoutMeta<WithoutSchema<Omit<TBoundWitness, GeneratedBoundWitnessFields>>>): this {
    const clone = structuredClone(fields) as unknown as Partial<TBoundWitness>
    for (const field of GeneratedBoundWitnessFields) {
      delete clone[field]
    }
    // we need to do the cast here since ts seems to not like nested, yet same, generics
    this._fields = omitSchema(
      BoundWitnessBuilder.omitMeta(
        removeEmptyFields(structuredClone(fields)),
      ),
    ) as unknown as WithoutMeta<WithoutSchema<TBoundWitness>>
    return this
  }

  hashes(hashes: Hash[], schema: Schema[]) {
    assertEx(this.payloads.length === 0, () => 'Can not set hashes when payloads already set')
    this._payloadHashes = hashes
    this._payloadSchemas = schema
    return this
  }

  payload(payload?: TPayload) {
    assertEx(this._payloadHashes === undefined, () => 'Can not set payloads when hashes already set')
    if (payload) {
      this._payloads.push(assertEx(sortFields<TPayload>(payload)))
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

  signer(account: AccountInstance) {
    uniqueAccounts([...this._accounts, account], true)
    this._accounts?.push(account)
    return this
  }

  signers(accounts: AccountInstance[]) {
    uniqueAccounts([...this._accounts, ...accounts], true)
    this._accounts?.push(...accounts)
    return this
  }

  sourceQuery(sourceQuery: Hash) {
    this._meta = {
      ...this._meta,
      $sourceQuery: sourceQuery,
    } as typeof this._meta
    return this
  }

  /** @deprecated use signer instead */
  witness(account: AccountInstance) {
    this._accounts?.push(account)
    return this
  }

  /** @deprecated use signers instead */
  witnesses(accounts: AccountInstance[]) {
    this._accounts?.push(...accounts)
    return this
  }

  protected async sign(): Promise<string[]> {
    uniqueAccounts(this._accounts, true)
    const hashBytes = toArrayBuffer(await this.dataHash())
    return await Promise.all(this._accounts.map(async account => hexFromArrayBuffer((await account.sign(hashBytes))[0])))
  }

  private async generatedFields(): Promise<Pick<TBoundWitness, GeneratedBoundWitnessFields>> {
    return await BoundWitnessBuilder.linkingFields(this._accounts, this._payloads)
  }

  private missingSchemaMessage(payload: Payload) {
    return `Builder: Missing Schema\n${JSON.stringify(payload, null, 2)}`
  }
}
