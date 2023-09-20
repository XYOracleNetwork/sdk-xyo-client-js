import { flatten } from '@xylabs/array'
import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import { staticImplements } from '@xylabs/static-implements'
import { AbstractDiviner } from '@xyo-network/abstract-diviner'
import { BoundWitness } from '@xyo-network/boundwitness-model'
import { normalizeAddress } from '@xyo-network/core'
import {
  BoundWitnessDivinerConfig,
  BoundWitnessDivinerConfigSchema,
  BoundWitnessDivinerQueryPayload,
  isBoundWitnessDivinerQueryPayload,
} from '@xyo-network/diviner-boundwitness-model'
import { DivinerParams } from '@xyo-network/diviner-model'
import { AnyConfigSchema, WithLabels } from '@xyo-network/module'
import { MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta } from '@xyo-network/node-core-model'
import { Payload } from '@xyo-network/payload-model'
import { BaseMongoSdk, BaseMongoSdkConfig, BaseMongoSdkPublicConfig } from '@xyo-network/sdk-xyo-mongo-js'
import { Filter, SortDirection } from 'mongodb'

import { DefaultLimit, DefaultMaxTimeMS, DefaultOrder } from '../../defaults'
import { removeId } from '../../Mongo'

export type MongoDBBoundWitnessDivinerConfig = BoundWitnessDivinerConfig & {
  boundWitnessSdkConfig?: Partial<BaseMongoSdkPublicConfig>
}

export type MongoDBBoundWitnessDivinerParams = DivinerParams<
  AnyConfigSchema<MongoDBBoundWitnessDivinerConfig>,
  {
    boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta>
    boundWitnessSdkConfig: Partial<BaseMongoSdkConfig>
  }
>

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export class MongoDBBoundWitnessDiviner<
  TParams extends MongoDBBoundWitnessDivinerParams = MongoDBBoundWitnessDivinerParams,
> extends AbstractDiviner<TParams> {
  static override configSchemas = [BoundWitnessDivinerConfigSchema]
  static labels = MongoDBStorageClassLabels

  private _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined

  get boundWitnessSdkConfig(): BaseMongoSdkConfig {
    return merge({}, this.params.boundWitnessSdkConfig, this.config.boundWitnessSdkConfig, {
      collection: this.config.boundWitnessSdkConfig?.collection ?? this.params.boundWitnessSdkConfig?.collection ?? 'bound_witnesses',
    })
  }

  get boundWitnesses() {
    this._boundWitnessSdk = this._boundWitnessSdk ?? new BaseMongoSdk<BoundWitnessWithMeta>(this.boundWitnessSdkConfig)
    return assertEx(this._boundWitnessSdk)
  }

  protected override async divineHandler(payloads?: Payload[]): Promise<Payload<BoundWitness>[]> {
    const query = payloads?.find<BoundWitnessDivinerQueryPayload>(isBoundWitnessDivinerQueryPayload)
    // TODO: Support multiple queries
    if (!query) return []
    // NOTE: We're supporting address (which is deprecated) until we can ensure that all
    // clients are using addresses
    const { address, addresses, hash, limit, order, payload_hashes, payload_schemas, timestamp } = query
    const parsedLimit = limit || DefaultLimit
    const parsedOrder = order || DefaultOrder
    const sort: { [key: string]: SortDirection } = { _timestamp: parsedOrder === 'asc' ? 1 : -1 }
    const filter: Filter<BoundWitnessWithMeta> = {}
    if (timestamp) {
      // TODO: Should we sort by timestamp instead of _timestamp here as well?
      filter.timestamp = parsedOrder === 'desc' ? { $exists: true, $lt: timestamp } : { $exists: true, $gt: timestamp }
    }
    if (hash) filter._hash = hash
    // NOTE: Defaulting to $all since it makes the most sense when singing addresses are supplied
    // but based on how MongoDB implements multi-key indexes $in might be much faster and we could
    // solve the multi-sig problem via multiple API calls when multi-sig is desired instead of
    // potentially impacting performance for all single-address queries
    const allAddresses = flatten(address, addresses).map(normalizeAddress)
    if (allAddresses.length) filter.addresses = allAddresses.length === 1 ? allAddresses[0] : { $all: allAddresses }
    if (payload_hashes?.length) filter.payload_hashes = { $in: payload_hashes }
    if (payload_schemas?.length) filter.payload_schemas = { $in: payload_schemas }
    return (await (await this.boundWitnesses.find(filter)).sort(sort).limit(parsedLimit).maxTimeMS(DefaultMaxTimeMS).toArray()).map(removeId)
  }
}
