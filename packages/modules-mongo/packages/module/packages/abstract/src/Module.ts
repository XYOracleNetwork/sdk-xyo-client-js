import { assertEx } from '@xylabs/assert'
import { merge } from '@xylabs/lodash'
import { staticImplements } from '@xylabs/static-implements'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleEventData, WithLabels } from '@xyo-network/module-model'
import { MongoDBModuleParams, MongoDBStorageClassLabels } from '@xyo-network/module-model-mongodb'
import { BoundWitnessWithMeta, PayloadWithMeta } from '@xyo-network/node-core-model'
import { BaseMongoSdk, BaseMongoSdkConfig } from '@xyo-network/sdk-xyo-mongo-js'

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export abstract class MongoDBModule<
  TParams extends MongoDBModuleParams = MongoDBModuleParams,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>,
> extends AbstractModuleInstance<TParams, TEventData> {
  static labels = MongoDBStorageClassLabels

  private _boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> | undefined
  private _payloadSdk: BaseMongoSdk<PayloadWithMeta> | undefined

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
