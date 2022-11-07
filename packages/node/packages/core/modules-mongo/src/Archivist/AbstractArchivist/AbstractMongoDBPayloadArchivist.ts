import 'reflect-metadata'

import { assertEx } from '@xylabs/assert'
import { XyoAccount } from '@xyo-network/account'
import { BoundWitnessBuilder, BoundWitnessBuilderConfig, BoundWitnessValidator, XyoBoundWitness } from '@xyo-network/boundwitness'
import { EmptyObject } from '@xyo-network/core'
import {
  AbstractPayloadArchivist,
  ArchiveModuleConfig,
  XyoBoundWitnessWithMeta,
  XyoPayloadFilterPredicate,
  XyoPayloadWithMeta,
  XyoPayloadWithPartialMeta,
} from '@xyo-network/node-core-model'
import { TYPES } from '@xyo-network/node-core-types'
import { XyoPayloadBuilder } from '@xyo-network/payload'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { inject, injectable, named } from 'inversify'
import LruCache from 'lru-cache'
import { ExplainVerbosity, Filter, OptionalUnlessRequiredId, WithoutId } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS } from '../../defaults'
import { removeId } from '../../Mongo'
import { MONGO_TYPES } from '../../types'

const builderConfig: BoundWitnessBuilderConfig = { inlinePayloads: false }

const valid = (bw: XyoBoundWitness) => {
  return new BoundWitnessValidator(bw).validate().length === 0
}

@injectable()
export abstract class AbstractMongoDBPayloadArchivist<T extends EmptyObject = EmptyObject> extends AbstractPayloadArchivist<T> {
  protected readonly witnessedPayloads: LruCache<string, XyoPayloadWithMeta<T>> = new LruCache({ max: 1, ttl: 10000 })

  public constructor(
    @inject(TYPES.Account) @named('root') protected readonly account: XyoAccount,
    @inject(MONGO_TYPES.PayloadSdkMongo) protected readonly payloads: BaseMongoSdk<XyoPayloadWithMeta<T>>,
    @inject(MONGO_TYPES.BoundWitnessSdkMongo) protected readonly boundWitnesses: BaseMongoSdk<XyoBoundWitnessWithMeta>,
    protected readonly config?: ArchiveModuleConfig,
  ) {
    super(account, config)
  }

  public abstract get schema(): string

  async _findWitnessPlan(_archive: string) {
    return (await this.findWitnessQuery(_archive)).explain(ExplainVerbosity.allPlansExecution)
  }

  find(_filter: XyoPayloadFilterPredicate<T>): Promise<XyoPayloadWithMeta<T>[]> {
    throw new Error('AbstractMongoDBPayloadArchivist: Find not implemented')
  }

  async get(ids: string[]): Promise<Array<XyoPayloadWithMeta<T>>> {
    assertEx(ids.length === 1, 'AbstractMongoDBPayloadArchivist: Retrieval of multiple payloads not supported')
    const archive: string = assertEx(this.config?.archive, 'AbstractMongoDBPayloadArchivist: Missing archivist')
    let lastWitness: XyoBoundWitnessWithMeta | undefined = undefined
    // NOTE: Optimistic search (assumes last witnessed payload is valid) with
    // fallback to more exhaustive walk backwards to find valid witnessed payload
    for (let offset = 0; offset < DefaultLimit; offset++) {
      const boundWitnesses = (await (await this.findWitnessQuery(archive, offset)).toArray()).filter(valid)
      const bw = boundWitnesses.pop()
      if (bw) {
        lastWitness = bw
        break
      }
    }
    if (!lastWitness) return []
    const witnessedPayloadIndex = lastWitness.payload_schemas.findIndex((s) => s === this.schema)
    assertEx(witnessedPayloadIndex > -1, `AbstractMongoDBPayloadArchivist: Invalid permissions index in BoundWitness (${lastWitness._hash})`)
    const _hash = assertEx(
      lastWitness.payload_hashes[witnessedPayloadIndex],
      `AbstractMongoDBPayloadArchivist: Missing permissions payload hash in BoundWitness (${lastWitness._hash})`,
    )
    const payloadFilter = { _archive: archive, _hash, schema: this.schema } as Filter<XyoPayloadWithMeta<T>>
    const payload = removeId(
      assertEx(
        await this.payloads.findOne(payloadFilter),
        `AbstractMongoDBPayloadArchivist: Missing Payload (${_hash}) from BoundWitness (${lastWitness._hash})`,
      ),
    ) as XyoPayloadWithMeta<T>
    // NOTE: This is a temporary optimization until we convert this module to a diviner
    this.witnessedPayloads.set(this.schema, payload)
    return [payload]
  }

  async insert(items: XyoPayloadWithPartialMeta<WithoutId<T>>[]): Promise<XyoBoundWitness[]> {
    const archive: string = assertEx(this.config?.archive, 'AbstractMongoDBPayloadArchivist: Missing archivist')
    const payloads = items.map((p) => {
      return {
        ...new XyoPayloadBuilder({ schema: this.schema }).fields(p).build(),
        _archive: archive,
        _timestamp: Date.now(),
      } as OptionalUnlessRequiredId<XyoPayloadWithMeta<T>>
    })
    const boundWitnesses: XyoBoundWitnessWithMeta[] = payloads.map((p) => {
      const [bw] = new BoundWitnessBuilder(builderConfig).witness(this.account).payload(p).build()
      return { ...bw, _archive: archive, _timestamp: Date.now() } as XyoBoundWitnessWithMeta
    })
    const payloadsResults = await this.payloads.insertMany(payloads)
    if (!payloadsResults.acknowledged || payloadsResults.insertedCount !== payloads.length)
      throw new Error('AbstractMongoDBPayloadArchivist: Error inserting Payloads')

    const witnessResults = await this.boundWitnesses.insertMany(boundWitnesses)
    if (!witnessResults.acknowledged || witnessResults.insertedCount !== boundWitnesses.length)
      throw new Error('AbstractMongoDBPayloadArchivist: Error inserting BoundWitnesses')

    const [bw] = await this.bindResult(items)
    this.witnessedPayloads.delete(this.schema)
    return [bw]
  }

  private async findWitnessQuery(archive: string, offset = 0) {
    const addresses: string = assertEx(this.account.addressValue.hex, 'AbstractMongoDBPayloadArchivist: Invalid signing account address')
    const filter: Filter<XyoBoundWitnessWithMeta> = { _archive: archive, addresses, payload_schemas: this.schema }
    return (await this.boundWitnesses.find(filter)).sort({ _timestamp: -1 }).skip(offset).limit(1).maxTimeMS(DefaultMaxTimeMS)
  }
}
