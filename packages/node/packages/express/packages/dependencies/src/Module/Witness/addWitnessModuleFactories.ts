import { HDWallet } from '@xyo-network/account'
import { CreatableModuleDictionary, ModuleFactory } from '@xyo-network/modules'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const getPrometheusNodeWitness = async (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = await (await HDWallet.fromMnemonic(mnemonic)).derivePath(WALLET_PATHS.Witnesses.Prometheus)
  return new ModuleFactory(PrometheusNodeWitness, {
    account,
    config: { name: TYPES.PrometheusWitness.description, schema: PrometheusNodeWitness.configSchema },
  })
}

export const addWitnessModuleFactories = async (container: Container) => {
  const dictionary = container.get<CreatableModuleDictionary>(TYPES.CreatableModuleDictionary)
  dictionary[PrometheusNodeWitness.configSchema] = await getPrometheusNodeWitness(container)
}
