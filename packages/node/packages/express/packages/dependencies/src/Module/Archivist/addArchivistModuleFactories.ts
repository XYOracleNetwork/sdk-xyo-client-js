import { HDWallet } from '@xyo-network/account'
import { MemoryArchivist } from '@xyo-network/archivist'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { MongoDBDeterministicArchivistConfigSchema } from '@xyo-network/node-core-modules-mongo'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getMongoDBArchivistFactory = async (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const wallet = await HDWallet.fromMnemonic(mnemonic)
  const accountDerivationPath = WALLET_PATHS.Archivists.Archivist
  return new ModuleFactory(MemoryArchivist, {
    config: { accountDerivationPath, name: TYPES.Archivist.description, schema: MemoryArchivist.configSchema },
    wallet,
  })
}

export const addArchivistModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MongoDBDeterministicArchivistConfigSchema] = await getMongoDBArchivistFactory(container)
  dictionary[MemoryArchivist.configSchema] = await getMongoDBArchivistFactory(container)
}
