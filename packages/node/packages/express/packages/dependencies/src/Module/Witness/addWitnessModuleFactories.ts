import { HDWallet } from '@xyo-network/account'
import { CryptoWalletNftWitness } from '@xyo-network/crypto-wallet-nft-plugin'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/module-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const getCryptoWalletNftWitness = async (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = await (await HDWallet.fromMnemonic(mnemonic)).derivePath?.(WALLET_PATHS.Witnesses.CryptoWalletNftWitness)
  return new ModuleFactory(CryptoWalletNftWitness, {
    account,
    config: { name: TYPES.CryptoWalletNftWitness.description, schema: CryptoWalletNftWitness.configSchema },
  })
}

const getPrometheusNodeWitness = async (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = await (await HDWallet.fromMnemonic(mnemonic)).derivePath?.(WALLET_PATHS.Witnesses.Prometheus)
  return new ModuleFactory(PrometheusNodeWitness, {
    account,
    config: { name: TYPES.PrometheusWitness.description, schema: PrometheusNodeWitness.configSchema },
  })
}

export const addWitnessModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[CryptoWalletNftWitness.configSchema] = await getCryptoWalletNftWitness(container)
  dictionary[PrometheusNodeWitness.configSchema] = await getPrometheusNodeWitness(container)
}
