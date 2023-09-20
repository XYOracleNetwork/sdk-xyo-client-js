import { staticImplements } from '@xylabs/static-implements'
import { AbstractModuleInstance } from '@xyo-network/module-abstract'
import { ModuleEventData, ModuleParams, WithLabels } from '@xyo-network/module-model'

import { MongoDBStorageClassLabels } from '../Mongo'

@staticImplements<WithLabels<MongoDBStorageClassLabels>>()
export abstract class MongoDBModule<
  TParams extends ModuleParams = ModuleParams,
  TEventData extends ModuleEventData<object> = ModuleEventData<object>,
> extends AbstractModuleInstance<TParams, TEventData> {
  static labels = MongoDBStorageClassLabels
}
