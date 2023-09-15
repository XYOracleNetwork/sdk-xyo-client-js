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
  protected readonly sampleConfig = {
    configMap: {
      boundWitnessCollection: {
        from: 'network.xyo.literal',
        value: 'boundwitness',
      },
      boundWitnessDb: {
        from: 'network.xyo.secrets',
        value: 'database1',
      },
      payloadCollection: {
        from: 'network.xyo.literal',
        value: 'boundwitness',
      },
      payloadDb: {
        from: 'network.xyo.secrets',
        value: 'database0',
      },
    },
    schema: 'network.xyo.module.mongodb.config',
    secrets: {
      database0: {
        kind: 'network.xyo.secrets.environment.template',
        placeholders: {
          domain: 'DOMAIN',
          password: 'PASSWORD',
          username: 'USERNAME',
        },
        value: 'mongodb+srv://${username}:${password}@${domain}/?authSource=admin&replicaSet=myRepl',
      },
      database1: {
        kind: 'network.xyo.secrets.environment.template',
        placeholders: {
          host: 'MONGO_HOST',
          password: 'MONGO_PASSWORD',
          port: 'MONGO_PORT',
          username: 'MONGO_USERNAME',
        },
        value: 'mongodb://${username}:${password}@${host}:${port}/?retryWrites=true&w=majority',
      },
    },
  }
}
