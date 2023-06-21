import { HDWallet } from '@xyo-network/account'
import { ArchivistConfigSchema, CreatableModuleDictionary, MemoryArchivist, ModuleFactory } from '@xyo-network/modules'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getMongoDBArchivistFactory = async (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const wallet = await HDWallet.fromMnemonic(mnemonic)
  const accountDerivationPath = WALLET_PATHS.Archivists.Archivist
  return new ModuleFactory(MemoryArchivist, {
    accountDerivationPath,
    config: { name: TYPES.Archivist.description, schema: MemoryArchivist.configSchema },
    wallet,
  })
}

export const addArchivistModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[ArchivistConfigSchema] = await getMongoDBArchivistFactory(container)
  dictionary[MemoryArchivist.configSchema] = await getMongoDBArchivistFactory(container)
}
