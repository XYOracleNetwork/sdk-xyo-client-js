import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import { staticImplements } from '@xylabs/static-implements'
import { Module } from '@xyo-network/module-model'
import { MongoDBModule, MongoDBModuleParams, MongoDBModuleStatic, MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, PayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

import { COLLECTIONS } from './Collections'
import { getBaseMongoSdkPrivateConfig } from './config'
import { IndexDescription } from './IndexDescription'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyAbstractModule<TParams extends MongoDBModuleParams = MongoDBModuleParams> = abstract new (...args: any[]) => Module<TParams>

export const MongoDBModuleMixin = <
  TParams extends MongoDBModuleParams = MongoDBModuleParams,
  TModule extends AnyAbstractModule<TParams> = AnyAbstractModule<TParams>,
>(
  ModuleBase: TModule,
) => {
  @staticImplements<MongoDBModuleStatic>()
  abstract class MongoModuleBase extends ModuleBase implements MongoDBModule {
    static labels = MongoDBStorageClassLabels
    _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined
    _payloadSdk: BaseMongoSdk<PayloadWithMeta> | undefined

    get boundWitnessSdkConfig(): BaseMongoSdkConfig {
      const config = { collection: COLLECTIONS.BoundWitnesses, ...getBaseMongoSdkPrivateConfig() }
      return merge(config, this.params.boundWitnessSdkConfig, this.config.boundWitnessSdkConfig, {
        collection: this.config.boundWitnessSdkConfig?.collection ?? this.params.boundWitnessSdkConfig?.collection ?? COLLECTIONS.BoundWitnesses,
      })
    }

    get boundWitnesses() {
      this._boundWitnessSdk = this._boundWitnessSdk ?? new BaseMongoSdk<BoundWitnessWithMeta>(this.boundWitnessSdkConfig)
      return assertEx(this._boundWitnessSdk)
    }

    get jobQueue() {
      return assertEx(this.params.jobQueue, 'MongoDBModule Error: jobQueue required for this module but is not defined')
    }

    get payloadSdkConfig(): BaseMongoSdkConfig {
      const config = { collection: COLLECTIONS.Payloads, ...getBaseMongoSdkPrivateConfig() }
      return merge(config, this.params.payloadSdkConfig, this.config.payloadSdkConfig, {
        collection: this.config.payloadSdkConfig?.collection ?? this.params.payloadSdkConfig?.collection ?? COLLECTIONS.Payloads,
      })
    }

    get payloads() {
      this._payloadSdk = this._payloadSdk ?? new BaseMongoSdk<PayloadWithMeta>(this.payloadSdkConfig)
      return assertEx(this._payloadSdk)
    }

    /**
     * Ensures any indexes specified within the config are created. This method should be idempotent
     * allowing for multiple calls without causing errors while ensuring the desired state.
     */
    async ensureIndexes(): Promise<void> {
      const configIndexes = (this.config as { storage?: { indexes?: IndexDescription[] } })?.storage?.indexes ?? []
      await this.boundWitnesses.useCollection(async (collection) => {
        const collectionName = collection.collectionName.toLowerCase()
        const indexes = configIndexes.filter((ix) => ix?.name?.toLowerCase().startsWith(collectionName))
        await collection.createIndexes(indexes)
      })
      await this.payloads.useCollection(async (collection) => {
        const collectionName = collection.collectionName.toLowerCase()
        const indexes = configIndexes.filter((ix) => ix?.name?.toLowerCase().startsWith(collectionName))
        await collection.createIndexes(indexes)
      })
    }
  }
  return MongoModuleBase
}
