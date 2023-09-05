import { HDWallet } from '@xyo-network/account'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { MemorySentinel, SentinelConfigSchema } from '@xyo-network/sentinel'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const getImageThumbnailSentinel = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(MemorySentinel, {
    config: {
      accountDerivationPath: WALLET_PATHS.Sentinels.ImageThumbnailSentinel,
      archivist: 'ThumbnailArchivist',
      name: TYPES.ThumbnailSentinel.description,
      schema: SentinelConfigSchema,
      witnesses: ['ImageThumbnailWitness', 'TimestampWitness'],
    },
    wallet,
  })
}

export const addSentinelModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MemorySentinel.configSchema] = await getImageThumbnailSentinel(container)
}
