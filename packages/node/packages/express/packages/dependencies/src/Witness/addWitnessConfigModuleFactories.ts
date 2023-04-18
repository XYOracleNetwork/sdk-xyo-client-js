import { Account } from '@xyo-network/account'
import { AnyConfigSchema } from '@xyo-network/modules'
import { ConfigModuleFactoryDictionary } from '@xyo-network/node-core-model'
import { TYPES, WALLET_PATHS } from '@xyo-network/node-core-types'
import { PrometheusNodeWitness, PrometheusNodeWitnessConfig } from '@xyo-network/prometheus-node-plugin'
import { Container } from 'inversify'

const getPrometheusNodeWitness = (container: Container) => {
  const mnemonic = container.get<string>(TYPES.AccountMnemonic)
  const account = Account.fromMnemonic(mnemonic, WALLET_PATHS.Witnesses.Prometheus)
  const factory = (config: AnyConfigSchema<PrometheusNodeWitnessConfig>) => {
    return PrometheusNodeWitness.create({
      account,
      config: { ...config, name: TYPES.PrometheusWitness.description, schema: PrometheusNodeWitness.configSchema },
    })
  }
  return factory
}

export const addDivinerConfigModuleFactories = (container: Container) => {
  const dictionary = container.get<ConfigModuleFactoryDictionary>(TYPES.ConfigModuleFactoryDictionary)
  dictionary[PrometheusNodeWitness.configSchema] = getPrometheusNodeWitness(container)
}
