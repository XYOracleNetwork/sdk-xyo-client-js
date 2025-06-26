import { assertEx } from '@xylabs/assert'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xylabs/mongo'
import { staticImplements } from '@xylabs/static-implements'
import { AbstractModule } from '@xyo-network/module-abstract'
import { ModuleEventData, ModuleParams } from '@xyo-network/module-model'
import {
  MongoDBModule, MongoDBModuleParams, MongoDBModuleStatic, MongoDBStorageClassLabels,
} from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMongoMeta, PayloadWithMongoMeta } from '@xyo-network/payload-mongodb'
import { merge } from 'lodash-es'

import { COLLECTIONS } from './Collections.ts'
import { getBaseMongoSdkPrivateConfig } from './config/index.ts'
import { ensureIndexesExistOnCollection, standardIndexes } from './ensureIndexesExistOnCollection.ts'
import { IndexDescription } from './IndexDescription.ts'

@staticImplements<MongoDBModuleStatic>()
export abstract class AbstractMongoModule<TParams extends MongoDBModuleParams = MongoDBModuleParams, TEventData extends ModuleEventData = ModuleEventData>
  extends AbstractModule<TParams & ModuleParams, TEventData> implements MongoDBModule {
  static override readonly labels = { ...AbstractModule.labels, ...MongoDBStorageClassLabels }
  _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMongoMeta> | undefined
  _payloadSdk: BaseMongoSdk<PayloadWithMongoMeta> | undefined

  get boundWitnessSdkConfig(): BaseMongoSdkConfig {
    const config = { collection: COLLECTIONS.BoundWitnesses, ...getBaseMongoSdkPrivateConfig() }
    return merge(
      config,
      this.params.boundWitnessSdkConfig,
      this.config.boundWitnessSdkConfig,
      { collection: this.config.boundWitnessSdkConfig?.collection ?? this.params.boundWitnessSdkConfig?.collection ?? COLLECTIONS.BoundWitnesses },
    )
  }

  get boundWitnesses() {
    this._boundWitnessSdk = this._boundWitnessSdk ?? new BaseMongoSdk<BoundWitnessWithMongoMeta>(this.boundWitnessSdkConfig)
    return assertEx(this._boundWitnessSdk)
  }

  get jobQueue() {
    return assertEx(this.params.jobQueue, () => 'MongoDBModule Error: jobQueue required for this module but is not defined')
  }

  get payloadSdkConfig(): BaseMongoSdkConfig {
    const config = { collection: COLLECTIONS.Payloads, ...getBaseMongoSdkPrivateConfig() }
    return merge(
      config,
      this.params.payloadSdkConfig,
      this.config.payloadSdkConfig,
      { collection: this.config.payloadSdkConfig?.collection ?? this.params.payloadSdkConfig?.collection ?? COLLECTIONS.Payloads },
    )
  }

  get payloads() {
    this._payloadSdk = this._payloadSdk ?? new BaseMongoSdk<PayloadWithMongoMeta>(this.payloadSdkConfig)
    return assertEx(this._payloadSdk)
  }

  /**
     * Ensures any indexes specified within the config are created. This method should be idempotent
     * allowing for multiple calls without causing errors while ensuring the desired state.
     */
  async ensureIndexes(): Promise<void> {
    const configIndexes = (this.config as { storage?: { indexes?: IndexDescription[] } })?.storage?.indexes ?? []
    const boundWitnessesCollectionName = this.boundWitnessSdkConfig.collection
    const payloadCollectionName = this.payloadSdkConfig.collection

    const bwStandardIndexes = standardIndexes.map(ix => ({ ...ix, name: `${boundWitnessesCollectionName}.${ix.name}` }))
    await ensureIndexesExistOnCollection(this.boundWitnesses, [...bwStandardIndexes, ...configIndexes])
    const payloadStandardIndexes = standardIndexes.map(ix => ({ ...ix, name: `${payloadCollectionName}.${ix.name}` }))
    await ensureIndexesExistOnCollection(this.payloads, [...payloadStandardIndexes, ...configIndexes])
  }
}
