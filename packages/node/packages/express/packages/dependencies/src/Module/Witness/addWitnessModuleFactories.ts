import { HDWallet } from '@xyo-network/account'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-wallet-nft-plugin'
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
  dictionary[CryptoWalletNftWitness.configSchema] = await getCryptoWalletNftWitness(container)
  dictionary[PrometheusNodeWitness.configSchema] = await getPrometheusNodeWitness(container)
}
