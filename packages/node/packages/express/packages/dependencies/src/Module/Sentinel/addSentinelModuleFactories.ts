import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { MemorySentinel, SentinelConfigSchema } from '@xyo-network/sentinel'
import { Container } from 'inversify'

const getImageThumbnailSentinel = () => {
  return new ModuleFactory(MemorySentinel, {
    config: {
      accountDerivationPath: WALLET_PATHS.Sentinels.ImageThumbnailSentinel,
      archivist: 'ThumbnailArchivist',
      name: TYPES.ThumbnailSentinel.description,
      schema: SentinelConfigSchema,
      witnesses: ['ImageThumbnailWitness', 'TimestampWitness'],
    },
  })
}

export const addSentinelModuleFactories = (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[MemorySentinel.configSchema] = getImageThumbnailSentinel()
}
