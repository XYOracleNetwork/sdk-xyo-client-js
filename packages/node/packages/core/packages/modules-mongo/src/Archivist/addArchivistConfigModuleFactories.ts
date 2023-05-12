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
  const wallet = HDWallet.fromMnemonic(mnemonic)
  const accountDerivationPath = WALLET_PATHS.Archivists.Archivist
  const boundWitnessSdk: BaseMongoSdk<BoundWitnessWithMeta> = getBoundWitnessSdk()
  const payloadSdk: BaseMongoSdk<PayloadWithMeta> = getPayloadSdk()
  const factory = async (config: AnyConfigSchema<ArchivistConfig>) =>
    await MongoDBDeterministicArchivist.create({
      accountDerivationPath,
      boundWitnessSdk,
      config: { ...config, name: TYPES.Archivist.description, schema: MongoDBDeterministicArchivist.configSchema },
      payloadSdk,
      wallet,
    })
  return factory
}

export const addArchivistConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[MongoDBDeterministicArchivist.configSchema] = getMongoDBArchivistFactory(container)
}
