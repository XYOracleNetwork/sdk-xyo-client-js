import { HDWallet } from '@xyo-network/account'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module'
import { MemoryArchivist } from '@xyo-network/modules'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { Container } from 'inversify'

const getMongoDBArchivistFactory = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const wallet = HDWallet.fromMnemonic(mnemonic)
  const accountDerivationPath = WALLET_PATHS.Archivists.Archivist
  return new ModuleFactory(MemoryArchivist, {
    accountDerivationPath,
    config: { name: TYPES.Archivist.description, schema: MemoryArchivist.configSchema },
    wallet,
  })
}

export const addArchivistModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MemoryArchivist.configSchema] = getMongoDBArchivistFactory(container)
}
