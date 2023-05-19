import { HDWallet } from '@xyo-network/account'
import { ArchivistConfigSchema } from '@xyo-network/archivist'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { BoundWitnessWithMeta, PayloadWithMeta } from '@xyo-network/node-core-model'
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
  return new ModuleFactory(MongoDBDeterministicArchivist, {
    accountDerivationPath,
    boundWitnessSdk,
    config: { name: TYPES.Archivist.description, schema: MongoDBDeterministicArchivist.configSchema },
    payloadSdk,
    wallet,
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[ArchivistConfigSchema] = getMongoDBArchivistFactory(container)
  dictionary[MongoDBDeterministicArchivist.configSchema] = getMongoDBArchivistFactory(container)
}
