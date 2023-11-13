import { CryptoNftCollectionWitness } from '@xyo-network/crypto-nft-collection-witness-plugin'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-nft-witness-wallet-plugin'
import { ImageThumbnailWitness } from '@xyo-network/image-thumbnail-plugin'
import { ModuleFactoryLocator } from '@xyo-network/module-model'
import { TYPES } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { getProviderFromEnv } from '@xyo-network/witness-blockchain-abstract'
import { TimestampWitness } from '@xyo-network/witness-timestamp'
import { Container } from 'inversify'

export const addWitnessModuleFactories = (container: Container) => {
  const locator = container.get<ModuleFactoryLocator>(TYPES.ModuleFactoryLocator)
  locator.register(CryptoNftCollectionWitness.factory({ provider: getProviderFromEnv() }))
  locator.register(
    CryptoWalletNftWitness.factory({ providers: [getProviderFromEnv(), getProviderFromEnv(), getProviderFromEnv(), getProviderFromEnv()] }),
  )
  locator.register(ImageThumbnailWitness)
  locator.register(PrometheusNodeWitness)
  locator.register(TimestampWitness)
}
