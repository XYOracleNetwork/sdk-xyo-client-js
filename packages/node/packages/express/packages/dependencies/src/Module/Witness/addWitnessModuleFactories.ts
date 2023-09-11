import { HDWallet } from '@xyo-network/account'
import { CryptoNftCollectionWitness } from '@xyo-network/crypto-nft-collection-witness-plugin'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-nft-witness-wallet-plugin'
import { ImageThumbnailWitness } from '@xyo-network/image-thumbnail-plugin'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { TimestampWitness, TimestampWitnessConfigSchema } from '@xyo-network/witness-timestamp'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const getCryptoWalletNftWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(CryptoWalletNftWitness, {
    config: {
      accountDerivationPath: WALLET_PATHS.Witnesses.CryptoWalletNftWitness,
      name: TYPES.CryptoWalletNftWitness.description,
      schema: CryptoWalletNftWitness.configSchema,
    },
    wallet,
  })
}

const getCryptoNftCollectionWitness = () => {
  return new ModuleFactory(CryptoNftCollectionWitness, { config: { schema: CryptoNftCollectionWitness.configSchema } })
}

const getImageThumbnailWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(ImageThumbnailWitness, {
    config: {
      accountDerivationPath: WALLET_PATHS.Witnesses.ImageThumbnailWitness,
      archivist: 'ThumbnailArchivist',
      name: TYPES.ImageThumbnailWitness.description,
      schema: ImageThumbnailWitness.configSchema,
    },
    wallet,
  })
}

const getPrometheusNodeWitness = () => {
  return new ModuleFactory(PrometheusNodeWitness, { config: { schema: PrometheusNodeWitness.configSchema } })
}

const getTimestampWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(TimestampWitness, {
    config: {
      accountDerivationPath: WALLET_PATHS.Witnesses.TimestampWitness,
      name: TYPES.TimestampWitness.description,
      schema: TimestampWitnessConfigSchema,
    },
    wallet,
  })
}

export const addWitnessModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[CryptoNftCollectionWitness.configSchema] = getCryptoNftCollectionWitness()
  dictionary[CryptoWalletNftWitness.configSchema] = await getCryptoWalletNftWitness(container)
  dictionary[ImageThumbnailWitness.configSchema] = await getImageThumbnailWitness(container)
  dictionary[PrometheusNodeWitness.configSchema] = getPrometheusNodeWitness()
  dictionary[TimestampWitnessConfigSchema] = await getTimestampWitness(container)
}
