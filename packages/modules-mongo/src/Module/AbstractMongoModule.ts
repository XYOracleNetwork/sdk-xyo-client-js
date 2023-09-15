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
        from: 'network.xyo.value.literal',
        value: 'boundwitness',
      },
      boundWitnessDb: {
        from: 'network.xyo.value.hash',
        value: 'database1',
      },
      payloadCollection: {
        from: 'network.xyo.value.literal',
        value: 'boundwitness',
      },
      payloadDb: {
        from: 'network.xyo.value.hash',
        value: 'database0',
      },
    },
    schema: 'network.xyo.module.mongodb.config',
    secrets: {
      database0: {
        placeholders: {
          domain: 'DOMAIN',
          password: 'PASSWORD',
          username: 'USERNAME',
        },
        schema: 'network.xyo.environment.witness.template',
        value: 'mongodb+srv://${username}:${password}@${domain}/?authSource=admin&replicaSet=myRepl',
      },
      database1: {
        placeholders: {
          host: 'MONGO_HOST',
          password: 'MONGO_PASSWORD',
          port: 'MONGO_PORT',
          username: 'MONGO_USERNAME',
        },
        replacementHash: '0xdeadbeef',
        schema: 'network.xyo.environment.witness.template',
        value: 'mongodb://${username}:${password}@${host}:${port}/?retryWrites=true&w=majority',
      },
      database2: {
        path: '/User/shatoshin/payloads.json',
        schema: 'network.xyo.file',
      },
      database3: {
        path: '0xdeadbeef', // Points to 'network.xyo.environment.witness.template'
        schema: 'network.xyo.secrets.hash',
      },
    },
  }
}
