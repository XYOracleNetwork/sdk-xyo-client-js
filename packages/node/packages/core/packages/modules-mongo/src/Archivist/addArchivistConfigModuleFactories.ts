import { HDWallet } from '@xyo-network/account'
import { ArchivistConfig } from '@xyo-network/archivist'
import { AnyConfigSchema } from '@xyo-network/module'
import { BoundWitnessWithMeta, ConfigModuleFactoryDictionary, PayloadWithMeta } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { BaseMongoSdk } from '@xyo-network/sdk-xyo-mongo-js'
import { Container } from 'inversify'

import { getBoundWitnessSdk, getPayloadSdk } from '../Mongo'
import { MongoDBDeterministicArchivist } from './Deterministic'

const getMongoDBArchivistFactory = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = HDWallet.fromMnemonic(mnemonic).derivePath(WALLET_PATHS.Archivists.Archivist)
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = async (config: AnyConfigSchema<ArchivistConfig>) =>
    await MongoDBDeterministicArchivist.create({
      account,
      boundWitnessSdk,
      config: { ...config, name: TYPES.Archivist.description, schema: MongoDBDeterministicArchivist.configSchema },
      payloadSdk,
    })
  return factory
}

export const addArchivistConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBDeterministicArchivist.configSchema] = getMongoDBArchivistFactory(container)
}
