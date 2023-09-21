import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import { staticImplements } from '@xylabs/static-implements'
import { Module } from '@xyo-network/module-model'
import { MongoDBModule, MongoDBModuleParams, MongoDBModuleStatic, MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, PayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAbstractModule<TParams extends MongoDBModuleParams = MongoDBModuleParams> = abstract new (...args: any[]) => Module<TParams>

export const MongoDBModuleMixin = <TModule extends AnyAbstractModule = AnyAbstractModule>(ModuleBase: TModule) => {
  @staticImplements<MongoDBModuleStatic>()
  abstract class MongoModuleBase extends ModuleBase implements MongoDBModule {
    static labels = MongoDBStorageClassLabels
    _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined
    _payloadSdk: BaseMongoSdk<PayloadWithMeta> | undefined

    get boundWitnessSdkConfig(): BaseMongoSdkConfig {
      return merge({}, this.params.boundWitnessSdkConfig, this.config.boundWitnessSdkConfig, {
        collection: this.config.boundWitnessSdkConfig?.collection ?? this.params.boundWitnessSdkConfig?.collection ?? 'bound_witnesses',
      })
    }

    get boundWitnesses() {
      this._boundWitnessSdk = this._boundWitnessSdk ?? new BaseMongoSdk<BoundWitnessWithMeta>(this.boundWitnessSdkConfig)
      return assertEx(this._boundWitnessSdk)
    }

    get payloadSdkConfig(): BaseMongoSdkConfig {
      return merge({}, this.params.payloadSdkConfig, this.config.payloadSdkConfig, {
        collection: this.config.payloadSdkConfig?.collection ?? this.params.payloadSdkConfig?.collection ?? 'payload',
      })
    }

    get payloads() {
      this._payloadSdk = this._payloadSdk ?? new BaseMongoSdk<PayloadWithMeta>(this.payloadSdkConfig)
      return assertEx(this._payloadSdk)
    }
  }
  return MongoModuleBase
}
