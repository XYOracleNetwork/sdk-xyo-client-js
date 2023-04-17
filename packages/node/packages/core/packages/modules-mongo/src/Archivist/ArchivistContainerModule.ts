import { Account } from '@xyo-network/account'
import { AbstractArchivist, ArchivistConfig } from '@xyo-network/archivist'
import { AnyConfigSchema } from '@xyo-network/module'
import { BoundWitnessWithMeta, ConfigModuleFactory, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { ContainerModule, interfaces } from 'inversify'

import { MONGO_TYPES } from '../mongoTypes'
import { MongoDBDeterministicArchivist } from './Deterministic'

let archivistFactory: ConfigModuleFactory<MongoDBDeterministicArchivist>

const getMongoDBArchivistFactory = (context: interfaces.Context): ConfigModuleFactory<AbstractArchivist> => {
  if (archivistFactory) return archivistFactory
  const mnemonic = context.container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Archivists.Archivist)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = context.container.get<BaseMongoSdk<BoundWitnessWithMeta>>(MONGO_TYPES.BoundWitnessSdk)
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = context.container.get<BaseMongoSdk<PayloadWithMeta>>(MONGO_TYPES.PayloadSdk)
  archivistFactory = async (config: AnyConfigSchema<ArchivistConfig>) =>
    await MongoDBDeterministicArchivist.create({
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.Archivist.description, schema: MongoDBDeterministicArchivist.configSchema },
      payloadSdk,
    })
  return archivistFactory
}

export const ArchivistContainerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<ConfigModuleFactory>(TYPES.Archivist).toDynamicValue(getMongoDBArchivistFactory).inSingletonScope()
})
