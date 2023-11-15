import { CryptoContractFunctionReadWitness } from '@xyo-network/crypto-contract-function-read-plugin'
import { CryptoNftCollectionWitness } from '@xyo-network/crypto-nft-collection-witness-plugin'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-nft-witness-wallet-plugin'
import { ImageThumbnailWitness } from '@xyo-network/image-thumbnail-plugin'
import { ModuleFactory, ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { ERC721__factory, ERC721Enumerable__factory, ERC1155__factory } from '@xyo-network/open-zeppelin-typechain'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'
import { TimestampWitness } from '@xyo-network/witness-timestamp'
import { Container } from 'inversify'

const getProviders = () => {
  return [
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
    getProviderFromEnv(),
  ]
}

export const addWitnessModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(CryptoNftCollectionWitness.factory({ provider: getProviderFromEnv() }))
  locator.register(
    CryptoWalletNftWitness.factory({
      providers: getProviders(),
    }),
  )
  locator.register(ImageThumbnailWitness)
  locator.register(PrometheusNodeWitness)
  locator.register(TimestampWitness)
  locator.register(
    new ModuleFactory(CryptoContractFunctionReadWitness, {
      config: { contract: ERC721__factory.abi },
      providers: getProviders(),
    }),
    { 'network.xyo.crypto.contract.interface': 'Erc721' },
  )

  locator.register(
    new ModuleFactory(CryptoContractFunctionReadWitness, {
      config: { contract: ERC721Enumerable__factory.abi },
      providers: getProviders(),
    }),
    { 'network.xyo.crypto.contract.interface': 'Erc721Enumerable' },
  )

  locator.register(
    new ModuleFactory(CryptoContractFunctionReadWitness, {
      config: { contract: ERC1155__factory.abi },
      providers: getProviders(),
    }),
    { 'network.xyo.crypto.contract.interface': 'Erc1155' },
  )
}
