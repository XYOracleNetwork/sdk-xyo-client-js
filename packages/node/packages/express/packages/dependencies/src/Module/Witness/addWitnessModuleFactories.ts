import { HDWallet } from '@xyo-network/account'
import { CryptoNftCollectionWitness } from '@xyo-network/crypto-nft-collection-witness-plugin'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-nft-plugin'
import { ImageThumbnailWitness } from '@xyo-network/image-thumbnail-plugin'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const getWallet = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  return HDWallet.fromMnemonic(mnemonic)
}

const getCryptoWalletNftWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(CryptoWalletNftWitness, {
    accountDerivationPath: WALLET_PATHS.Witnesses.CryptoWalletNftWitness,
    config: { name: TYPES.CryptoWalletNftWitness.description, schema: CryptoWalletNftWitness.configSchema },
    wallet,
  })
}

const getCryptoNftCollectionWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(CryptoNftCollectionWitness, {
    accountDerivationPath: WALLET_PATHS.Witnesses.CryptoNftCollectionWitness,
    config: {
      archivist: TYPES.Archivist.description,
      name: TYPES.CryptoNftCollectionWitness.description,
      schema: CryptoNftCollectionWitness.configSchema,
    },
    wallet,
  })
}

const getImageThumbnailWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(ImageThumbnailWitness, {
    accountDerivationPath: WALLET_PATHS.Witnesses.ImageThumbnailWitness,
    config: { name: TYPES.ImageThumbnailWitness.description, schema: ImageThumbnailWitness.configSchema },
    wallet,
  })
}

const getPrometheusNodeWitness = async (container: Container) => {
  const wallet = await getWallet(container)
  return new ModuleFactory(PrometheusNodeWitness, {
    accountDerivationPath: WALLET_PATHS.Witnesses.Prometheus,
    config: { name: TYPES.PrometheusWitness.description, schema: PrometheusNodeWitness.configSchema },
    wallet,
  })
}

export const addWitnessModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[CryptoNftCollectionWitness.configSchema] = await getCryptoNftCollectionWitness(container)
  dictionary[CryptoWalletNftWitness.configSchema] = await getCryptoWalletNftWitness(container)
  dictionary[PrometheusNodeWitness.configSchema] = await getPrometheusNodeWitness(container)
}
